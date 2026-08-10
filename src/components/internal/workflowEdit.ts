/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  type Branch,
  type Stage,
  type Step,
  type VerbSpec,
  WHILE_DEFAULT_MAX_ITERATIONS,
  type WorkflowDefinition,
} from "../../workflowData";

// Pure tree-mutation helpers for the Flow Designer working copy. All operate on
// a WorkflowDefinition draft (already deep-cloned by the caller) and mutate in
// place. The component composes these behind an undo/redo history stack.
// Internal to the component layer.

let idSeq = 0;
export const nextId = (verb: string): string => {
  idSeq += 1;
  return `s-${verb}-${Date.now().toString(36)}-${idSeq}`;
};

// Build a fresh step for a verb spec, seeding branch/child lanes so the shape
// reads immediately. A 3rd-party spec maps onto its base verb name but keeps its
// own label + config seed.
export const makeStep = (spec: VerbSpec): Step => {
  const verb = spec.name;
  const base: Step = {
    config: spec.source === "third_party" && spec.vendor ? { _vendor: spec.vendor } : {},
    id: nextId(verb),
    label: spec.label,
    type: verb,
  };
  if (verb === "decision")
    base.branches = [
      { caseLabel: "TRUE", cond: "", id: `${base.id}-t`, steps: [] },
      { caseLabel: "FALSE", cond: "", id: `${base.id}-f`, steps: [] },
    ];
  if (verb === "switch")
    base.branches = [
      { caseLabel: "case 1", cond: "", id: `${base.id}-c1`, steps: [] },
      { caseLabel: "default", cond: "", id: `${base.id}-d`, steps: [] },
    ];
  if (verb === "parallel") {
    base.config.join = "wait-all";
    base.children = [
      { caseLabel: "trail 1", id: `${base.id}-b1`, steps: [] },
      { caseLabel: "trail 2", id: `${base.id}-b2`, steps: [] },
    ];
  }
  if (verb === "while") base.config.maxIterations = String(WHILE_DEFAULT_MAX_ITERATIONS);
  if (verb === "foreach" || verb === "while")
    // A loop body defaults to loop-back (non-terminal); leave `terminal` unset.
    base.children = [{ caseLabel: "body", id: `${base.id}-body`, steps: [] }];
  // map is a loop, but its per-item body is OPTIONAL — a plain map is just a
  // per-item expression. Start with NO child body (the panel adds one on
  // demand). Seed a sensible item-var default.
  if (verb === "map") base.config.as = base.config.as || "item";
  // filter defaults to KEEP (normal) mode.
  if (verb === "filter") base.config.mode = base.config.mode || "keep";
  if (verb === "try_catch")
    // TRY defaults to rejoin (loop-back); CATCH is forced terminal.
    base.children = [
      { caseLabel: "try", id: `${base.id}-try`, steps: [] },
      { caseLabel: "catch", id: `${base.id}-catch`, steps: [], terminal: true },
    ];
  if (verb === "manual_approval") {
    base.config.rule = base.config.rule || "single";
    base.config.dueIn = base.config.dueIn || "48h";
    // Approved continues (non-terminal, rejoins an entry); reject + timeout end.
    base.branches = [
      {
        caseLabel: "Approved",
        id: `${base.id}-appr`,
        steps: [],
        terminal: false,
      },
      {
        caseLabel: "Rejected",
        id: `${base.id}-rej`,
        steps: [],
        terminal: true,
      },
      {
        caseLabel: "Timed-out",
        id: `${base.id}-to`,
        steps: [],
        terminal: true,
      },
    ];
  }
  if (verb === "collect_input") {
    base.config.dueIn = base.config.dueIn || "24h";
    base.branches = [
      {
        caseLabel: "Submitted",
        id: `${base.id}-sub`,
        steps: [],
        terminal: false,
      },
      {
        caseLabel: "Timed-out",
        id: `${base.id}-to`,
        steps: [],
        terminal: true,
      },
    ];
  }
  if (verb === "entry" && !base.config.name) base.config.name = spec.label;
  return base;
};

// Deep-clone a step, minting fresh ids for it and all descendants (for copy).
export const cloneStepFresh = (step: Step): Step => {
  const copy: Step = {
    ...step,
    config: { ...step.config },
    id: nextId(step.type),
  };
  if (step.branches) copy.branches = step.branches.map((b) => cloneBranchFresh(b));
  if (step.children) copy.children = step.children.map((b) => cloneBranchFresh(b));
  return copy;
};

const cloneBranchFresh = (branch: Branch): Branch => ({
  ...branch,
  id: `${nextId("lane")}`,
  steps: branch.steps.map((s) => cloneStepFresh(s)),
});

// Find the steps array owned by ownerId (a stage or a lane) across the whole
// workflow. Returns the array reference (mutable) or undefined.
export const findOwnerSteps = (
  workflow: WorkflowDefinition,
  ownerId: string,
): Step[] | undefined => {
  for (const stage of workflow.stages) {
    if (stage.id === ownerId) return stage.steps;
    const found = findLaneSteps(stage.steps, ownerId);
    if (found) return found;
  }
  return undefined;
};

const findLaneSteps = (steps: Step[], ownerId: string): Step[] | undefined => {
  for (const step of steps) {
    for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) {
      if (lane.id === ownerId) return lane.steps;
      const nested = findLaneSteps(lane.steps, ownerId);
      if (nested) return nested;
    }
  }
  return undefined;
};

// Locate a step + its containing array + index.
export interface StepLocation {
  index: number;
  owner: Step[];
  step: Step;
}
export const locateStep = (
  workflow: WorkflowDefinition,
  stepId: string,
): StepLocation | undefined => {
  const search = (steps: Step[]): StepLocation | undefined => {
    for (let index = 0; index < steps.length; index += 1) {
      if (steps[index].id === stepId) return { index: index, owner: steps, step: steps[index] };
      for (const lane of [...(steps[index].branches ?? []), ...(steps[index].children ?? [])]) {
        const found = search(lane.steps);
        if (found) return found;
      }
    }
    return undefined;
  };
  for (const stage of workflow.stages) {
    const found = search(stage.steps);
    if (found) return found;
  }
  return undefined;
};

export const insertAt = (owner: Step[], index: number, step: Step): void => {
  owner.splice(Math.max(0, Math.min(index, owner.length)), 0, step);
};

// Delete a step, RE-STITCHING: its children/branch steps of the FIRST lane are
// lifted up into its position so successors below are preserved. (For a plain
// node, this is just removal. For a decision, the TRUE lane's steps are lifted;
// callers wanting a clean cut use deleteCascade.)
export const deleteRestitch = (workflow: WorkflowDefinition, stepId: string): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc) return false;
  const { index, owner, step } = loc;
  const lanes = [...(step.branches ?? []), ...(step.children ?? [])];
  const lifted = lanes[0]?.steps ?? [];
  owner.splice(index, 1, ...lifted);
  return true;
};

// Delete a step AND everything it contains (its lanes + their subtrees). Nodes
// BELOW it in the same sequence are preserved.
export const deleteCascade = (workflow: WorkflowDefinition, stepId: string): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc) return false;
  loc.owner.splice(loc.index, 1);
  return true;
};

// Move a step (by id) to a target owner+index. Removes from current location,
// re-inserts. No-op if target is inside the moved subtree (would orphan).
export const moveStep = (
  workflow: WorkflowDefinition,
  stepId: string,
  targetOwnerId: string,
  targetIndex: number,
): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc) return false;
  // Guard: don't drop a node into its own subtree.
  if (isOwnerInsideStep(loc.step, targetOwnerId)) return false;
  const [moved] = loc.owner.splice(loc.index, 1);
  const target = findOwnerSteps(workflow, targetOwnerId);
  if (!target) {
    // rollback
    loc.owner.splice(loc.index, 0, moved);
    return false;
  }
  // If moving within the same array and removing shifted the index, adjust.
  let index = targetIndex;
  if (target === loc.owner && loc.index < targetIndex) index -= 1;
  insertAt(target, index, moved);
  return true;
};

const isOwnerInsideStep = (step: Step, ownerId: string): boolean => {
  for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) {
    if (lane.id === ownerId) return true;
    for (const s of lane.steps) if (isOwnerInsideStep(s, ownerId)) return true;
  }
  return false;
};

// The owner id + index immediately above/below a step (for insert-relative).
export const relativeTarget = (
  workflow: WorkflowDefinition,
  stepId: string,
  where: "above" | "below",
): { index: number; ownerId: string } | undefined => {
  const loc = locateStep(workflow, stepId);
  if (!loc) return undefined;
  const ownerId = ownerIdOf(workflow, loc.owner);
  if (!ownerId) return undefined;
  return { index: where === "above" ? loc.index : loc.index + 1, ownerId };
};

const ownerIdOf = (workflow: WorkflowDefinition, target: Step[]): string | undefined => {
  for (const stage of workflow.stages) {
    if (stage.steps === target) return stage.id;
  }
  let found: string | undefined;
  const walk = (steps: Step[]): void => {
    for (const step of steps) {
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) {
        if (lane.steps === target) found = lane.id;
        walk(lane.steps);
      }
    }
  };
  for (const stage of workflow.stages) walk(stage.steps);
  return found;
};

// Locate a lane (branch/child) by its id, returning the lane + its owning step.
export const locateLane = (
  workflow: WorkflowDefinition,
  laneId: string,
): { lane: Branch; step: Step } | undefined => {
  let result: { lane: Branch; step: Step } | undefined;
  const walk = (steps: Step[]): void => {
    for (const step of steps) {
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) {
        if (lane.id === laneId) result = { lane, step };
        walk(lane.steps);
      }
    }
  };
  for (const stage of workflow.stages) walk(stage.steps);
  return result;
};

// Shallow-patch a lane's own fields (terminal / merge / caseLabel / cond).
export const patchLane = (
  workflow: WorkflowDefinition,
  laneId: string,
  patch: Partial<Branch>,
): boolean => {
  const found = locateLane(workflow, laneId);
  if (!found) return false;
  Object.assign(found.lane, patch);
  return true;
};

// Add a fresh case/branch lane to a switch/parallel (for completeness in menus).
export const addLane = (workflow: WorkflowDefinition, stepId: string, label: string): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc) return false;
  const lane: Branch = { caseLabel: label, id: nextId("lane"), steps: [] };
  if (loc.step.branches) loc.step.branches.push(lane);
  else if (loc.step.children) loc.step.children.push(lane);
  else return false;
  return true;
};

// --- MAP OPTIONAL BODY ------------------------------------------------------
// map is a loop with an OPTIONAL per-item child body. These toggle the body
// lane on/off for a given map step (mirrors the foreach body shape).
export const addMapBody = (workflow: WorkflowDefinition, stepId: string): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc || loc.step.type !== "map") return false;
  if (loc.step.children && loc.step.children.length > 0) return false;
  // Loop body defaults to loop-back (non-terminal) — leave `terminal` unset.
  loc.step.children = [{ caseLabel: "body", id: `${loc.step.id}-body`, steps: [] }];
  return true;
};

export const removeMapBody = (workflow: WorkflowDefinition, stepId: string): boolean => {
  const loc = locateStep(workflow, stepId);
  if (!loc || loc.step.type !== "map") return false;
  delete loc.step.children;
  return true;
};

// --- ADD STAGE --------------------------------------------------------------
// Insert a fresh empty WORK stage. Work stages live between the pre-stage and
// the end-stage; `afterStageId` places the new stage immediately after that
// stage (default: as the last work stage, just before the end-stage). Returns
// the new stage id so the caller can focus it.
export const addStage = (workflow: WorkflowDefinition, afterStageId?: string): string => {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${workflow.stages.length}`;
  const stage: Stage = {
    id: `st-${uuid}`,
    kind: "stage",
    name: "",
    steps: [],
  };
  const endIndex = workflow.stages.findIndex((s) => s.kind === "end-stage");
  // Default insert position: just before the end-stage (append as last work
  // stage). If no end-stage, append at the very end.
  let insertAtIndex = endIndex === -1 ? workflow.stages.length : endIndex;
  if (afterStageId) {
    const afterIndex = workflow.stages.findIndex((s) => s.id === afterStageId);
    if (afterIndex !== -1) {
      const candidate = afterIndex + 1;
      // Never insert after the end-stage or before the pre-stage.
      insertAtIndex = endIndex === -1 ? candidate : Math.min(candidate, endIndex);
    }
  }
  workflow.stages.splice(insertAtIndex, 0, stage);
  return stage.id;
};

// Remove a WORK stage by id — ONLY when it is empty (no steps). Pre/end stages
// and any stage that still holds steps are never removed. Returns true if a
// stage was removed.
export const removeStage = (workflow: WorkflowDefinition, stageId: string): boolean => {
  const index = workflow.stages.findIndex((s) => s.id === stageId);
  if (index === -1) return false;
  const stage = workflow.stages[index];
  if (stage.kind !== "stage" || stage.steps.length > 0) return false;
  workflow.stages.splice(index, 1);
  return true;
};

// Is a given owner (stage/lane) inside the pre-stage?
export const ownerInPreStage = (workflow: WorkflowDefinition, ownerId: string): boolean => {
  const pre = workflow.stages.find((s) => s.kind === "pre-stage");
  return Boolean(pre && pre.id === ownerId);
};

// Does the target owner+index have a following node on the same trail?
export const targetHasFollowing = (
  workflow: WorkflowDefinition,
  ownerId: string,
  index: number,
): boolean => {
  const owner = findOwnerSteps(workflow, ownerId);
  return Boolean(owner && index < owner.length);
};
