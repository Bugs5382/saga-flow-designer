import {
  type Branch,
  type Stage,
  type StageKind,
  type Step,
  type VerbName,
  type WorkflowDef,
} from "./workflowData";

// --- FLATTEN / EXPAND MAPPER -------------------------------------------------
//
// The reusable crux of the host gateway: translate between the ENGINE-FLAT
// workflow definition the engine speaks and the UI's NESTED Stage tree the
// designer renders.
//
// ENGINE-FLAT shape (the `definition` Map the host persists / returns as
// `WorkflowDefinition`):
//
//   { id, name, description, version, published, start, steps: [EngineStep] }
//
// The engine model is a FLAT step list forming a DAG:
//   - Non-branching steps chain to their single successor via `next` (a step id).
//   - A branching step carries `branches: { [caseLabel]: { next } }` — a MAP from
//     a case label to a pointer at the FIRST step of that lane. A branching step
//     has NO `next`; all outflow travels through its branch map.
//   - Terminal steps (end / cancel / error) have no `next`.
//   - The graph converges: several paths may point at the SAME downstream step
//     (in-degree >= 2). Those convergence steps must appear exactly once.
//
// The UI-NESTED shape is `WorkflowDef` (workflowData.ts): ordered Stages, each a
// `Step[]`, decision/switch/human-gate steps holding `branches`, fan-out/loop
// steps holding `children`, each lane its own `Step[]`. Only a `Branch` (lane)
// can carry a `merge` (a rejoin pointer); a plain backbone step cannot. So a
// step that two paths converge on is INLINED into the first lane that reaches
// it, and every LATER path that reaches it ends its lane with a `merge` pointing
// at that step id. This keeps every step exactly once AND lets flatten rebuild
// the full edge set (the first incoming edge becomes a linear `next`, each later
// incoming edge becomes a merge that flatten re-links back to `next`).
//
// KNOWN, INTENTIONAL LOSSES (the engine contract has no field for these):
//   - trigger        → expand synthesises a default `manual` trigger.
//   - system/source  → dropped; every expanded def is a USER flow.
//   - status/enabled → collapsed onto the single engine `published` boolean.
// Non-empty stages, all step config, branch/child lane nesting, merge targets
// and terminal flags round-trip; empty pre/end stages are re-synthesised.

/**
 * A pointer into the flat step list: the first step of a branch lane.
 *
 * @since 1.0.0
 */
export interface EngineBranchPointer {
  next: string;
}

/**
 * The engine-flat definition. `id` is the business workflowId; `workflowId` is
 * present on the host read path (a distinct field) and preferred for `key` when
 * available.
 *
 * @since 1.0.0
 */
export interface EngineDefinition {
  description?: string;
  id: string;
  name: string;
  published: boolean;
  start: string;
  steps: EngineStep[];
  version: number;
  workflowId?: string;
}

/**
 * The engine's flat step. Engine-meaningful keys: id, type, action, next,
 * branches (a MAP), inputs. Designer metadata (label, note, collapsed, stage)
 * rides along untouched by the engine.
 *
 * @since 1.0.0
 */
export interface EngineStep {
  action?: string;
  branches?: Record<string, EngineBranchPointer>;
  collapsed?: boolean;
  id: string;
  inputs?: Record<string, string>;
  label?: string;
  next?: string;
  note?: string;
  stage?: { id: string; kind: StageKind; name: string };
  type: VerbName;
}

// Verbs whose lanes live under `branches` in the UI model (everything else that
// has lanes uses `children`). Human gates fan out labelled outcome lanes too.
const BRANCH_OWNERS = new Set<VerbName>([
  "collect_input",
  "decision",
  "manual_approval",
  "switch",
]);

// Terminal verbs get no `next` pointer — nothing runs after them on their trail.
const TERMINALS = new Set<VerbName>(["cancel", "end", "error"]);

// A step is a branching step iff it carries a non-empty branch map.
const hasLanes = (engine: EngineStep): boolean =>
  engine.branches !== undefined && Object.keys(engine.branches).length > 0;

// --- FLATTEN (UI nested → engine flat) --------------------------------------

// Link an ordered engine-step trail with `next` pointers, skipping terminals and
// branch owners (whose outflow travels through their branch map, not `next`).
const linkTrail = (steps: EngineStep[]): void => {
  for (let i = 0; i < steps.length - 1; i += 1) {
    const current = steps[i];
    if (TERMINALS.has(current.type) || current.branches) continue;
    current.next = steps[i + 1].id;
  }
};

/**
 * UI nested WorkflowDef → engine-flat definition JSON (the `definition` Map the
 * host's save mutation accepts). `id` is the engine business id
 * (WorkflowDef.key); the storage UUID (WorkflowDef.id) is the server's concern
 * and is threaded by the gateway, not embedded here.
 *
 * @since 1.0.0
 */
export const flattenDefinition = (ui: WorkflowDef): EngineDefinition => {
  const steps: EngineStep[] = [];

  // Emit a single UI step (recursing its lanes) into the flat list; return it.
  const emitStep = (step: Step): EngineStep => {
    const inputs = { ...step.config };
    delete inputs.action;
    const engine: EngineStep = { id: step.id, type: step.type };
    if (Object.keys(inputs).length > 0) engine.inputs = inputs;
    if (step.config.action !== undefined) engine.action = step.config.action;
    if (step.label !== undefined) engine.label = step.label;
    if (step.note !== undefined) engine.note = step.note;
    if (step.collapsed !== undefined) engine.collapsed = step.collapsed;
    steps.push(engine);

    const lanes = step.branches ?? step.children;
    if (lanes && lanes.length > 0) {
      const map: Record<string, EngineBranchPointer> = {};
      for (const lane of lanes) {
        const entry = emitLane(lane);
        if (entry !== undefined) map[lane.caseLabel] = { next: entry };
      }
      engine.branches = map;
    }
    return engine;
  };

  // Emit a lane's steps, next-link its internal trail, and return the engine
  // step id its flow ENTERS: the first step id, or (for a merge-only lane) the
  // merge entryId. A lane ending in a merge links its last real step to the
  // merge entryId.
  const emitLane = (lane: Branch): string | undefined => {
    if (lane.steps.length === 0) return lane.merge?.entryId;
    const laneSteps = lane.steps.map((s) => emitStep(s));
    linkTrail(laneSteps);
    if (lane.merge) {
      const last = laneSteps[laneSteps.length - 1];
      if (!TERMINALS.has(last.type) && !last.branches) {
        last.next = lane.merge.entryId;
      }
    }
    return laneSteps[0].id;
  };

  // Backbone: every top-level stage step, in order, next-linked as one trail.
  const backbone: EngineStep[] = [];
  for (const stage of ui.stages) {
    for (const step of stage.steps) {
      const engine = emitStep(step);
      engine.stage = { id: stage.id, kind: stage.kind, name: stage.name };
      backbone.push(engine);
    }
  }
  linkTrail(backbone);

  return {
    description: ui.description ?? "",
    id: ui.key,
    name: ui.label,
    published: ui.status === "published",
    start: backbone[0]?.id ?? "",
    steps,
    version: ui.version,
  };
};

// --- EXPAND (engine flat → UI nested) ---------------------------------------

// How a walked trail terminated (drives the lane's terminal flag / merge).
interface TrailEnd {
  merge?: Branch["merge"];
  terminal?: boolean;
}

// Build a UI Step from an engine step WITHOUT its lanes (attached by the caller).
const expandOne = (engine: EngineStep): Step => {
  const config: Record<string, string> = { ...(engine.inputs ?? {}) };
  if (engine.action !== undefined) config.action = engine.action;
  const step: Step = {
    config,
    id: engine.id,
    label: engine.label ?? "",
    type: engine.type,
  };
  if (engine.note !== undefined) step.note = engine.note;
  if (engine.collapsed !== undefined) step.collapsed = engine.collapsed;
  return step;
};

// Group ordered top-level steps back into Stages by their stage annotation,
// preserving encounter order, then bracket with a pre-stage first and an
// end-stage last (synthesising empty ones when the annotations omitted them).
const regroupStages = (
  steps: Step[],
  engineId: string,
  byId: Map<string, EngineStep>,
): Stage[] => {
  const byStageId = new Map<string, Stage>();
  const order: string[] = [];
  let orphanCounter = 0;
  for (const step of steps) {
    const meta = byId.get(step.id)?.stage ?? {
      id: `${engineId}::stage-${(orphanCounter += 1)}`,
      kind: "stage" as StageKind,
      name: "",
    };
    let stage = byStageId.get(meta.id);
    if (!stage) {
      stage = { id: meta.id, kind: meta.kind, name: meta.name, steps: [] };
      byStageId.set(meta.id, stage);
      order.push(meta.id);
    }
    stage.steps.push(step);
  }

  const stages = order.map((id) => byStageId.get(id) as Stage);
  const pre = stages.filter((s) => s.kind === "pre-stage");
  const end = stages.filter((s) => s.kind === "end-stage");
  const work = stages.filter(
    (s) => s.kind !== "pre-stage" && s.kind !== "end-stage",
  );

  const preStage: Stage = pre[0] ?? {
    id: `${engineId}::pre`,
    kind: "pre-stage",
    name: "Trigger",
    steps: [],
  };
  const endStage: Stage = end[0] ?? {
    id: `${engineId}::end`,
    kind: "end-stage",
    name: "",
    steps: [],
  };
  // Preserve any extra (malformed) pre/end stages after the canonical ones so
  // validation can still flag them rather than silently dropping content.
  return [preStage, ...work, ...pre.slice(1), ...end.slice(1), endStage];
};

/**
 * Engine-flat definition → UI nested WorkflowDef.
 *   - `key`  ← engine.workflowId (business id), falling back to engine.id.
 *   - `id`   ← storageId (the host's storage UUID) when supplied, else the
 *              business id. The gateway always passes the storage UUID so
 *              getWorkflow(id)/run linkage resolves against it.
 *
 * @since 1.0.0
 */
export const expandDefinition = (
  engine: EngineDefinition,
  storageId?: string,
): WorkflowDef => {
  const byId = new Map(engine.steps.map((s) => [s.id, s] as const));
  const placed = new Set<string>();

  // Walk a trail from startId via `next`, CLAIMING each fresh step into `out`
  // (recursively expanding nested branching steps). Stops at: a terminal
  // (included), a branching step (included; its lanes carry outflow), a step
  // with no `next` (natural end), or an ALREADY-CLAIMED step (a convergence /
  // rejoin). For a lane (allowMerge) the rejoin ends the lane with a merge
  // pointing at that step; the backbone (no merge holder) simply stops.
  const walkTrail = (
    startId: string | undefined,
    out: Step[],
    allowMerge: boolean,
  ): TrailEnd => {
    let cursor = startId;
    while (cursor !== undefined && cursor !== "") {
      if (placed.has(cursor)) {
        return allowMerge ? { merge: { entryId: cursor, inputs: {} } } : {};
      }
      const engine = byId.get(cursor);
      if (!engine) return {};
      placed.add(cursor);
      const step = expandOne(engine);

      if (hasLanes(engine)) {
        const lanes: Branch[] = [];
        const keys = Object.keys(engine.branches as object);
        for (let i = 0; i < keys.length; i += 1) {
          const caseLabel = keys[i];
          const laneSteps: Step[] = [];
          const end = walkTrail(
            (engine.branches as Record<string, EngineBranchPointer>)[caseLabel]
              .next,
            laneSteps,
            true,
          );
          const lane: Branch = {
            caseLabel,
            id: `${engine.id}::lane-${i}`,
            steps: laneSteps,
          };
          if (end.merge) lane.merge = end.merge;
          if (end.terminal) lane.terminal = true;
          lanes.push(lane);
        }
        if (BRANCH_OWNERS.has(engine.type)) step.branches = lanes;
        else step.children = lanes;
        out.push(step);
        return {};
      }

      out.push(step);
      if (TERMINALS.has(engine.type)) return { terminal: true };
      cursor = engine.next;
      if (cursor === undefined) return { terminal: true };
    }
    return {};
  };

  const backbone: Step[] = [];
  walkTrail(engine.start, backbone, false);
  // Defensive: place any step unreachable from `start` so nothing is dropped.
  for (const engineStep of engine.steps) {
    if (!placed.has(engineStep.id)) walkTrail(engineStep.id, backbone, false);
  }

  const businessId = engine.workflowId ?? engine.id;
  return {
    description: engine.description ?? "",
    enabled: engine.published,
    id: storageId ?? businessId,
    key: businessId,
    label: engine.name,
    stages: regroupStages(backbone, businessId, byId),
    status: engine.published ? "published" : "draft",
    trigger: { kind: "manual", label: "Manual start" },
    version: engine.version,
  };
};
