// Pill scope + verb placement legality for the Flow Designer.
//
// A "pill" is a reference token the author can drop into an expression/value
// field: a record field (record.<field>), a trigger input (trigger.<x>), or a
// variable produced by an upstream node (vars.<name> / <resultVar>). Scope is
// POSITIONAL — a node only sees pills produced at or ABOVE it on its trail.

import {
  entryDeclaredInputs,
  humanTaskOutputRefs,
  RECORD_TYPES,
  setVarAssignments,
  type Stage,
  type Step,
  TERMINAL_VERBS,
  type VerbName,
  type VerbSpec,
  type WorkflowDef,
} from "./workflowData";

export interface Pill {
  kind: PillKind;
  label: string;
  origin: string; // where it comes from (record type, trigger, node label)
  ref: string; // the token inserted, e.g. "record.priority" or "vars.priority"
}

export type PillKind = "field" | "output" | "trigger";

// The pills a trigger contributes: the source record's fields + a couple of
// trigger metadata inputs.
export const triggerPills = (workflow: WorkflowDef): Pill[] => {
  const pills: Pill[] = [];
  const rec = workflow.trigger.recordType
    ? RECORD_TYPES[workflow.trigger.recordType]
    : undefined;
  if (rec) {
    for (const field of rec.fields)
      pills.push({
        kind: "field",
        label: field.label,
        origin: `${rec.label} record`,
        ref: `record.${field.name}`,
      });
  }
  pills.push(
    {
      kind: "trigger",
      label: "Triggering user",
      origin: "Trigger",
      ref: "trigger.actor",
    },
    {
      kind: "trigger",
      label: "Trigger timestamp",
      origin: "Trigger",
      ref: "trigger.at",
    },
  );
  return pills;
};

// The variable pills a single node PRODUCES (its outputs). Positional scope adds
// these for downstream nodes on the same trail.
export const stepOutputPills = (step: Step): Pill[] => {
  const c = step.config;
  const mk = (name: string): Pill => ({
    kind: "output",
    label: `${step.label} output`,
    origin: step.label,
    ref: name.startsWith("vars.") ? name : `vars.${name}`,
  });
  switch (step.type) {
    case "collect_input":
    case "manual_approval": {
      return humanTaskOutputRefs(step).map((ref) => ({
        kind: "output" as PillKind,
        label: `${step.label} output`,
        origin: step.label,
        ref,
      }));
    }
    case "filter":
    case "http_request":
    case "merge":
    case "transform": {
      return c.resultVar ? [mk(c.resultVar)] : [];
    }
    case "foreach": {
      return c.as
        ? [
            {
              kind: "output",
              label: `each ${c.as}`,
              origin: step.label,
              ref: `item.${c.as}`,
            },
          ]
        : [];
    }
    case "map": {
      // map is a loop: the result collection var + the per-item var in its body.
      const pills: Pill[] = [];
      if (c.resultVar) pills.push(mk(c.resultVar));
      if (c.as)
        pills.push({
          kind: "output",
          label: `each ${c.as}`,
          origin: step.label,
          ref: `item.${c.as}`,
        });
      return pills;
    }
    case "parallel": {
      return c.join === "aggregate" && c.resultVar ? [mk(c.resultVar)] : [];
    }
    case "set_var": {
      // One OR many assignments — every named row becomes a pill.
      return setVarAssignments(step)
        .filter((r) => r.name.trim())
        .map((r) => mk(r.name));
    }
    default: {
      return [];
    }
  }
};

// Compute the pills in scope for a target node id: trigger pills + the outputs
// of every node that lies at or above it on its enclosing trail(s). Walks the
// stage/step tree and accumulates outputs along the path to the target.
export const pillsInScopeFor = (
  workflow: WorkflowDef,
  targetId?: string,
): Pill[] => {
  const scope: Pill[] = [...triggerPills(workflow)];
  if (!targetId) return scope;

  let found = false;
  const walk = (steps: Step[]): boolean => {
    for (const step of steps) {
      if (step.id === targetId) {
        found = true;
        return true;
      }
      // Its branch/child lanes: within a lane, upstream siblings are in scope,
      // and everything above the node is already accumulated.
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) {
        const before = scope.length;
        if (walk(lane.steps)) return true;
        // If not found inside the lane, siblings-inside-lane outputs shouldn't
        // leak to the outer trail — trim back what the lane pushed.
        scope.length = before;
      }
      // Node's own outputs become visible to nodes AFTER it on this trail.
      scope.push(...stepOutputPills(step));
    }
    return false;
  };

  for (const stage of workflow.stages) {
    if (walk(stage.steps)) break;
  }
  return found ? scope : [...triggerPills(workflow)];
};

// --- PLACEMENT LEGALITY -----------------------------------------------------
// Given a slot (the pills in scope there + what precedes/follows), decide which
// verbs are legal. The palette flags illegal verbs; drag/insert reject them; the
// path validator enforces the same rules.

export interface Legality {
  ok: boolean;
  reason?: string;
}

export interface SlotContext {
  // Does the workflow contain an emit_signal anywhere (for wait_for_signal)?
  hasEmitSignal: boolean;
  // Is there a node ON THIS TRAIL after the slot? (can't place terminal verbs
  // if something follows them).
  hasFollowing: boolean;
  // Is this slot inside the pre-stage? (pre-stage accepts only data steps).
  inPreStage: boolean;
  scope: Pill[];
}

export const verbLegalAt = (spec: VerbSpec, ctx: SlotContext): Legality => {
  // The pre-stage runs BEFORE the first work stage — it exists to shape the
  // trigger payload, so it accepts data-manipulation verbs only (the Data
  // group: set_var, transform, merge, filter, map). No actions, waits, or
  // control flow up here.
  if (ctx.inPreStage && spec.group !== "Data")
    return {
      ok: false,
      reason:
        "The Pre-Stage accepts only data steps — set variables, transform, merge, filter, map.",
    };
  if (TERMINAL_VERBS.has(spec.name) && ctx.hasFollowing)
    return {
      ok: false,
      reason: `${spec.label} is terminal — nothing may run after it on this trail.`,
    };
  if (spec.name === "wait_for_signal" && !ctx.hasEmitSignal)
    return {
      ok: false,
      reason: "wait_for_signal needs an emit_signal somewhere to deliver it.",
    };
  return { ok: true };
};

// Does the workflow contain an emit_signal anywhere?
export const workflowHasEmitSignal = (workflow: WorkflowDef): boolean => {
  let has = false;
  const walk = (steps: Step[]): void => {
    for (const step of steps) {
      if (step.type === "emit_signal") has = true;
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])])
        walk(lane.steps);
    }
  };
  for (const stage of workflow.stages) walk(stage.steps);
  return has;
};

// Helper: which pill refs a step references in its config (for scope checks).
export const referencedPills = (step: Step): string[] => {
  const refs: string[] = [];
  const re = /\b(?:record|vars|trigger|item)\.[A-Za-z0-9_]+/g;
  for (const value of Object.values(step.config)) {
    const matches = value.match(re);
    if (matches) refs.push(...matches);
  }
  return [...new Set(refs)];
};

// Convenience: find the stage a step id lives in (top level only — nodes in
// lanes report their owning stage).
export const stageOfStep = (
  workflow: WorkflowDef,
  stepId: string,
): Stage | undefined => {
  const contains = (steps: Step[]): boolean => {
    for (const step of steps) {
      if (step.id === stepId) return true;
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])])
        if (contains(lane.steps)) return true;
    }
    return false;
  };
  return workflow.stages.find((stage) => contains(stage.steps));
};

export const isTerminalVerb = (type: VerbName): boolean =>
  TERMINAL_VERBS.has(type);

// --- ENTRY POINTS -----------------------------------------------------------
// The entry-point nodes a rejoining (merge) lane can target, with the data
// contract each declares. Loops synthesise an implicit entry at their body head;
// the pickable set here is the AUTHOR-PLACED `entry` verbs anywhere in the flow.
export interface EntryPoint {
  inputs: string[]; // declared input names (the contract)
  name: string;
  stepId: string;
}

export const entryPoints = (workflow: WorkflowDef): EntryPoint[] => {
  const found: EntryPoint[] = [];
  const walk = (steps: Step[]): void => {
    for (const step of steps) {
      if (step.type === "entry")
        found.push({
          inputs: entryDeclaredInputs(step),
          name: step.config.name || step.label || step.id,
          stepId: step.id,
        });
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])])
        walk(lane.steps);
    }
  };
  for (const stage of workflow.stages) walk(stage.steps);
  return found;
};

export const findEntryPoint = (
  workflow: WorkflowDef,
  entryId: string,
): EntryPoint | undefined =>
  entryPoints(workflow).find((e) => e.stepId === entryId);
