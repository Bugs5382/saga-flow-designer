import type { ValidationIssue, ValidationResult } from "./workflowGateway";

import {
  type Branch,
  composeIsoDuration,
  durationExceedsCap,
  humanTaskOutputRefs,
  laneIsTerminal,
  laneRoleFor,
  laneSemantics,
  MERGEABLE_OWNERS,
  parseDurationParts,
  setVarAssignments,
  type Step,
  TERMINAL_VERBS,
  VERB_BY_NAME,
  type VerbName,
  type WorkflowDef,
} from "./workflowData";
import { entryPoints, referencedPills, triggerPills } from "./workflowScope";

// STRUCTURAL validation of a WorkflowDef — no network, purely in-process. Shared
// by every gateway adapter so they can never drift: the same static checks run
// whichever data source the host selects.

// --- REQUIRED-CONFIG rules --------------------------------------------------
// The config keys each verb must have filled to be publishable. First-cut, per
// the co-design catalog.
const REQUIRED_CONFIG: Partial<Record<Step["type"], string[]>> = {
  // action = RabbitMQ publish: needs the verb + target queue.
  action: ["action", "queue"],
  collect_input: ["form"],
  decision: ["condition"],
  emit_signal: ["signal"],
  foreach: ["items", "as"],
  http_request: ["method", "url"],
  manual_approval: ["gate", "approvers"],
  map: ["items", "as"],
  metric_emit: ["metric", "value"],
  switch: ["on"],
  // set_var is validated specially (≥1 assignment row with a name) — see the
  // set_var branch of the config check below; no static key list here.
  transform: ["resultVar", "expression"],
  // wait_duration is validated specially (composed combo, ≤ 365-day cap).
  wait_for_signal: ["signal"],
  webhook: ["webhook"],
  while: ["condition"],
};

// --- PATH ENUMERATION -------------------------------------------------------
// A "path" is one concrete route through the flow: a fixed choice at each
// decision (TRUE/FALSE), switch (one case), and a fixed treatment of each
// parallel/foreach (branches run then rejoin — unless a branch is terminal).
//
// We enumerate paths as sequences of visited nodes with the set of pills in
// scope carried along, then validate each. To keep it a real (bounded)
// traversal we cap the number of enumerated paths.

interface Path {
  nodes: PathNode[];
  reachedEnd: boolean; // path arrived at the end-stage (or a valid terminal)
  terminatedEarly?: string; // set if a terminal verb (cancel/error) ended it
}

interface PathNode {
  choiceLabel: string; // e.g. "P1=TRUE" — for readable per-path messages
  scope: Set<string>; // pill refs in scope AT this node
  step: Step;
}

const MAX_PATHS = 512;

const varRef = (n: string): string => (n.startsWith("vars.") ? n : `vars.${n}`);

const stepOutputs = (step: Step): string[] => {
  const c = step.config;
  switch (step.type) {
    case "collect_input":
    case "manual_approval": {
      return humanTaskOutputRefs(step);
    }
    case "filter":
    case "http_request":
    case "merge":
    case "transform": {
      return c.resultVar ? [varRef(c.resultVar)] : [];
    }
    case "foreach": {
      return c.as ? [`item.${c.as}`] : [];
    }
    case "map": {
      // map is a loop: exposes the result var AND the per-item var in the body.
      const outs: string[] = [];
      if (c.resultVar) outs.push(varRef(c.resultVar));
      if (c.as) outs.push(`item.${c.as}`);
      return outs;
    }
    case "parallel": {
      return c.join === "aggregate" && c.resultVar ? [varRef(c.resultVar)] : [];
    }
    case "set_var": {
      // One OR many assignments — every named row becomes a pill.
      return setVarAssignments(step)
        .filter((r) => r.name.trim())
        .map((r) => varRef(r.name));
    }
    default: {
      return [];
    }
  }
};

// Enumerate every path through a linear list of steps, forking on branch verbs.
// Returns the set of path-suffixes (each a list of PathNode) continuing from an
// incoming scope. `label` accumulates the branch-choice trail.
const enumerateSteps = (
  steps: Step[],
  incomingScope: Set<string>,
  label: string,
  budget: { count: number },
): { scope: Set<string>; suffix: PathNode[]; terminated?: string }[] => {
  // Start with a single empty suffix and the incoming scope.
  let paths: { scope: Set<string>; suffix: PathNode[]; terminated?: string }[] =
    [{ scope: new Set(incomingScope), suffix: [] }];

  for (const step of steps) {
    const nextPaths: typeof paths = [];
    for (const path of paths) {
      if (path.terminated) {
        // Dead trail — nothing after a terminal verb runs.
        nextPaths.push(path);
        continue;
      }
      if (budget.count > MAX_PATHS) {
        nextPaths.push(path);
        continue;
      }
      const nodeScope = new Set(path.scope);
      const node: PathNode = { choiceLabel: label, scope: nodeScope, step };
      const baseSuffix = [...path.suffix, node];
      const afterScope = new Set(nodeScope);
      for (const out of stepOutputs(step)) afterScope.add(out);

      const branches = step.branches ?? [];
      const children = step.children ?? [];

      if (TERMINAL_VERBS.has(step.type)) {
        nextPaths.push({
          scope: afterScope,
          suffix: baseSuffix,
          terminated: step.label,
        });
        continue;
      }

      if (step.type === "decision" || step.type === "switch") {
        // Fork: one continuation per branch. Every branch DEFAULTS TO END; a
        // branch only continues the trail when it explicitly merges/rejoins.
        for (const [laneIndex, branch] of branches.entries()) {
          const terminal = laneIsTerminal(
            step.type,
            laneRoleFor(step.type, laneIndex),
            branch,
          );
          const branchLabel = `${label ? `${label}, ` : ""}${labelFor(step)}=${branch.caseLabel}`;
          const sub = enumerateSteps(
            branch.steps,
            afterScope,
            branchLabel,
            budget,
          );
          for (const s of sub) {
            budget.count += 1;
            nextPaths.push({
              scope: terminal ? afterScope : s.scope,
              suffix: [...baseSuffix, ...s.suffix],
              // A terminal branch (default) OR a sub-terminal: path stops here.
              // A non-terminal branch merges to a sub-entry — for path purposes
              // it does not "fall through" the main trail below the construct,
              // so it also ends this enumerated route.
              terminated: terminal
                ? `${labelFor(step)} ${branch.caseLabel} branch ends`
                : (s.terminated ??
                  `${labelFor(step)} ${branch.caseLabel} branch merges`),
            });
          }
        }
        // A decision/switch itself never "falls through" — every route is a
        // branch — so we replace, not extend, the main trail here.
        continue;
      }

      if (children.length > 0) {
        // parallel/join/foreach/while/try_catch: each child is an isolated
        // trail. Children DEFAULT TO END; loop bodies + try lanes loop back.
        // The main flow below the construct only exists for loops (which
        // continue after the loop) — we thread children into the suffix for
        // reporting and carry forward the outputs of non-terminal children.
        let mergedSuffix = baseSuffix;
        const mainScope = new Set(afterScope);
        for (const [laneIndex, child] of children.entries()) {
          const role = laneRoleFor(step.type, laneIndex);
          const terminal = laneIsTerminal(step.type, role, child);
          const childLabel = `${label ? `${label}, ` : ""}${labelFor(step)}/${child.caseLabel}`;
          const sub = enumerateSteps(
            child.steps,
            afterScope,
            childLabel,
            budget,
          );
          for (const s of sub) {
            budget.count += 1;
            mergedSuffix = [...mergedSuffix, ...s.suffix];
            if (!terminal && !s.terminated)
              for (const p of s.scope) mainScope.add(p);
          }
        }
        nextPaths.push({ scope: mainScope, suffix: mergedSuffix });
        continue;
      }

      // Plain node.
      nextPaths.push({ scope: afterScope, suffix: baseSuffix });
    }
    paths = nextPaths;
  }
  return paths;
};

const labelFor = (step: Step): string =>
  step.label || VERB_BY_NAME[step.type]?.label || step.type;

// Build all whole-workflow paths: thread the stages (pre → work → end) in order,
// carrying scope across stage boundaries.
const enumerateWorkflow = (workflow: WorkflowDef): Path[] => {
  const budget = { count: 0 };
  const initialScope = new Set(triggerPills(workflow).map((p) => p.ref));

  const workStages = workflow.stages.filter((s) => s.kind !== "pre-stage");
  const hasEndStage = workflow.stages.some((s) => s.kind === "end-stage");

  let paths: { scope: Set<string>; suffix: PathNode[]; terminated?: string }[] =
    [{ scope: initialScope, suffix: [] }];

  for (const stage of workStages) {
    const nextPaths: typeof paths = [];
    for (const path of paths) {
      if (path.terminated) {
        nextPaths.push(path);
        continue;
      }
      const sub = enumerateSteps(stage.steps, path.scope, "", budget);
      for (const s of sub)
        nextPaths.push({
          scope: s.scope,
          suffix: [...path.suffix, ...s.suffix],
          terminated: path.terminated ?? s.terminated,
        });
    }
    paths = nextPaths;
  }

  return paths.map((p) => ({
    nodes: p.suffix,
    reachedEnd: hasEndStage && !p.terminated,
    terminatedEarly: p.terminated,
  }));
};

// --- VALIDATION -------------------------------------------------------------
/**
 * Run the structural, in-process checks over a definition and return the issues.
 *
 * @since 1.0.0
 */
export const validateWorkflow = (workflow: WorkflowDef): ValidationResult => {
  const issues: ValidationIssue[] = [];

  // 0. Structural: exactly one pre-stage + one end-stage.
  const pre = workflow.stages.filter((s) => s.kind === "pre-stage");
  const end = workflow.stages.filter((s) => s.kind === "end-stage");
  if (pre.length !== 1)
    issues.push({
      level: "error",
      message: `Expected exactly one Pre-Stage, found ${pre.length}.`,
    });
  if (end.length !== 1)
    issues.push({
      level: "error",
      message: `Expected exactly one End Stage, found ${end.length}.`,
    });

  // Entry-point contracts, indexed by step id, for merge-target validation.
  const entries = new Map(entryPoints(workflow).map((e) => [e.stepId, e]));

  // 1. Per-node structural checks (across every stage/lane).
  const seen = new Set<string>();
  let stepCount = 0;

  // Validate a lane's TERMINATION / MERGE contract given its owner + role.
  const checkLaneMerge = (
    ownerId: string,
    ownerType: VerbName,
    branch: Branch,
    laneIndex: number,
  ): void => {
    const role = laneRoleFor(ownerType, laneIndex);
    const semantics = laneSemantics(ownerType, role, branch);
    // Only decision/switch/parallel/join lanes carry an explicit merge target.
    if (!MERGEABLE_OWNERS.has(ownerType)) {
      // A loop body / try lane must not smuggle a merge target.
      if (branch.merge)
        issues.push({
          level: "warning",
          message: `${branch.caseLabel}: merge targets are only for decision/switch/parallel/join lanes.`,
          stepId: ownerId,
        });
      return;
    }
    if (semantics !== "merge") return; // terminal lane — nothing to check.

    // Non-terminal (merging) lane: a valid merge target is REQUIRED.
    const target = branch.merge;
    if (!target?.entryId) {
      issues.push({
        level: "error",
        message: `${branch.caseLabel} lane rejoins but has no merge target — set an entry point (or mark the lane as End).`,
        stepId: ownerId,
      });
      return;
    }
    const entry = entries.get(target.entryId);
    if (!entry) {
      issues.push({
        level: "error",
        message: `${branch.caseLabel} lane merges to an unknown entry point "${target.entryId}".`,
        stepId: ownerId,
      });
      return;
    }
    // The data contract: every declared entry input must be supplied.
    for (const name of entry.inputs) {
      if (!target.inputs?.[name]?.trim())
        issues.push({
          level: "error",
          message: `${branch.caseLabel} lane → entry "${entry.name}": missing required input "${name}".`,
          stepId: ownerId,
        });
    }
  };

  const checkStep = (step: Step): void => {
    stepCount += 1;
    if (seen.has(step.id))
      issues.push({
        level: "error",
        message: `Duplicate step id "${step.id}".`,
        stepId: step.id,
      });
    seen.add(step.id);
    if (!step.label.trim())
      issues.push({
        level: "warning",
        message: "Step has no label.",
        stepId: step.id,
      });
    if (step.type === "decision" && (step.branches?.length ?? 0) < 2)
      issues.push({
        level: "error",
        message: "Decision needs at least two branches.",
        stepId: step.id,
      });
    if (step.type === "switch" && (step.branches?.length ?? 0) < 2)
      issues.push({
        level: "error",
        message: "Switch needs at least two cases.",
        stepId: step.id,
      });
    if (step.type === "parallel") {
      if ((step.children?.length ?? 0) < 2)
        issues.push({
          level: "warning",
          message: "Parallel with fewer than two trails.",
          stepId: step.id,
        });
      if (step.config.join === "quorum" && !step.config.quorum)
        issues.push({
          level: "error",
          message: "Quorum join needs a quorum N.",
          stepId: step.id,
        });
    }
    // set_var: at least one assignment row with a name (D1).
    if (step.type === "set_var") {
      const named = setVarAssignments(step).filter((r) => r.name.trim());
      if (named.length === 0)
        issues.push({
          level: "error",
          message: `${labelFor(step)}: needs at least one assignment with a variable name.`,
          stepId: step.id,
        });
    }
    // wait_duration: composed combo must be set and within the 365-day cap (W1).
    if (step.type === "wait_duration") {
      const parts = parseDurationParts(step.config);
      const composed = step.config.duration?.trim();
      if (!composed)
        issues.push({
          level: "error",
          message: `${labelFor(step)}: set a wait duration.`,
          stepId: step.id,
        });
      if (durationExceedsCap(parts))
        issues.push({
          level: "error",
          message: `${labelFor(step)}: duration exceeds the 365-day cap.`,
          stepId: step.id,
        });
    }
    // wait_until: the active mode's inputs must be present (W2).
    if (step.type === "wait_until") {
      if (step.config.mode === "relative") {
        if (durationExceedsCap(parseDurationParts(step.config)))
          issues.push({
            level: "error",
            message: `${labelFor(step)}: relative offset exceeds the 365-day cap.`,
            stepId: step.id,
          });
        if (!composeIsoDuration(parseDurationParts(step.config)))
          issues.push({
            level: "error",
            message: `${labelFor(step)}: set a relative offset.`,
            stepId: step.id,
          });
      } else if (!step.config.until?.trim()) {
        issues.push({
          level: "error",
          message: `${labelFor(step)}: set an absolute datetime (pill / CEL).`,
          stepId: step.id,
        });
      }
    }
    // Per-lane merge/termination contract (branches AND children share indices
    // per their own arrays — role derives from owner type + index).
    for (const [i, lane] of (step.branches ?? []).entries())
      checkLaneMerge(step.id, step.type, lane, i);
    for (const [i, lane] of (step.children ?? []).entries())
      checkLaneMerge(step.id, step.type, lane, i);
    for (const lane of [...(step.branches ?? []), ...(step.children ?? [])])
      for (const laneStep of lane.steps) checkStep(laneStep);
  };
  for (const stage of workflow.stages)
    for (const stageStep of stage.steps) checkStep(stageStep);
  if (stepCount === 0)
    issues.push({ level: "error", message: "Workflow has no steps." });

  // 2. Path enumeration: for each concrete path verify End reachability,
  // required config, and pill scope.
  const paths = enumerateWorkflow(workflow);
  const reportedScope = new Set<string>();
  const reportedConfig = new Set<string>();

  for (const [index, path] of paths.entries()) {
    const tag = describePath(path, index);

    // 2a. End reachability. A path that neither reached the end-stage nor ended
    // on an intentional terminal (cancel/error) is dangling.
    if (!path.reachedEnd && !path.terminatedEarly) {
      issues.push({
        level: "error",
        message: `Path ${tag} never reaches a valid End.`,
      });
    }

    // 2b. Walk the path checking config + scope positionally.
    for (const pn of path.nodes) {
      const { step } = pn;

      // Required config (report once per step to avoid path-count spam).
      const required = REQUIRED_CONFIG[step.type] ?? [];
      for (const key of required) {
        const missKey = `${step.id}:${key}`;
        if (!step.config[key]?.trim() && !reportedConfig.has(missKey)) {
          reportedConfig.add(missKey);
          issues.push({
            level: "error",
            message: `${labelFor(step)}: missing required "${key}".`,
            stepId: step.id,
          });
        }
      }

      // Pill scope: every referenced pill must be in scope at this node ON THIS
      // PATH. record.* pills are always in scope (record is ambient); vars.* /
      // item.* must have been produced above.
      for (const ref of referencedPills(step)) {
        if (ref.startsWith("record.") || ref.startsWith("trigger.")) continue;
        if (!pn.scope.has(ref)) {
          const key = `${step.id}:${ref}:${tag}`;
          if (!reportedScope.has(key)) {
            reportedScope.add(key);
            issues.push({
              level: "error",
              message: `Path ${tag} → ${labelFor(step)}: pill "${ref}" is not in scope here.`,
              stepId: step.id,
            });
          }
        }
      }
    }
  }

  if (paths.length >= MAX_PATHS)
    issues.push({
      level: "warning",
      message: `Path space capped at ${MAX_PATHS}; validation covered the first ${MAX_PATHS} paths.`,
    });

  return { issues, ok: issues.every((issue) => issue.level !== "error") };
};

const describePath = (path: Path, index: number): string => {
  const choices = [
    ...new Set(path.nodes.map((n) => n.choiceLabel).filter(Boolean)),
  ];
  return choices.length > 0 ? `[${choices.join("; ")}]` : `#${index + 1}`;
};
