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
import type { Run } from "../runData";
import type { WorkflowDefinition } from "../workflowData";
import type { ValidationResult, WorkflowGateway } from "../workflowGateway";

import { validateWorkflow } from "../workflowValidation";
import { cloneExampleRuns } from "./exampleRuns";
import { cloneExampleWorkflows, exampleSystemDefault } from "./exampleWorkflows";

// In-memory WorkflowGateway. Resolves entirely in-process from the example
// seed, so a consumer can spin up the designer, runs list, and run detail with
// no host and no backend. Every method returns the same Promise / unsubscribe
// shape as a real gateway, so the same UI runs against it unchanged. Each
// instance owns its own mutable store, so saves and lifecycle edits survive
// navigation within a session without leaking across instances.

// Interval between replayed frames, in milliseconds. Small enough to feel live,
// large enough to watch the timeline and canvas overlay fill in.
const REPLAY_INTERVAL_MS = 700;

// Replay a run frame-by-frame onto `onUpdate`: open with an empty, running
// snapshot, then reveal one more step (and a proportional slice of the event
// log + taken path) on each tick until the full seeded run is reached. Returns
// an unsubscribe that stops the replay. This stands in for a live engine stream
// so RunDetail animates in the demo instead of snapping straight to the result.
const replayRun = (seed: Run, onUpdate: (run: Run) => void): (() => void) => {
  const target = structuredClone(seed);
  const total = target.stepRuns.length;
  let tick = 0;
  let interval: null | ReturnType<typeof setInterval> = null;

  const emit = (): void => {
    const isLast = tick >= total;
    const revealed = target.stepRuns.slice(0, tick);
    const revealedIds = new Set(revealed.map((step) => step.stepId));
    const path = target.path.filter((id) => revealedIds.has(id));
    const eventCount =
      total === 0 ? target.events.length : Math.round((target.events.length * tick) / total);
    const snapshot: Run = {
      ...target,
      durationMs: isLast ? target.durationMs : undefined,
      events: isLast ? target.events : target.events.slice(0, eventCount),
      finishedAt: isLast ? target.finishedAt : undefined,
      path,
      status: isLast ? target.status : "running",
      stepRuns: revealed,
    };
    onUpdate(snapshot);
    tick += 1;
    if (tick > total && interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  emit();
  if (tick <= total) interval = setInterval(emit, REPLAY_INTERVAL_MS);

  return (): void => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };
};

const byStartedAtDesc = (a: Run, b: Run): number =>
  new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();

/**
 * A fully in-memory {@link WorkflowGateway} seeded with generic example
 * workflows and runs. Instantiate one per designer session; it doubles as the
 * Storybook and standalone-demo data source.
 *
 * @since 1.0.0
 */
export class MockWorkflowGateway implements WorkflowGateway {
  private readonly runStore: Run[] = cloneExampleRuns();
  private readonly store: WorkflowDefinition[] = cloneExampleWorkflows();

  createWorkflow = (): Promise<WorkflowDefinition> => {
    const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${this.store.length + 1}`;
    const shortKey = uuid.slice(0, 8);
    const draft: WorkflowDefinition = {
      description: "",
      enabled: true,
      id: `wf-${uuid}`,
      key: `new.flow.${shortKey}`,
      label: "New flow",
      stages: [
        { id: `st-${uuid}-pre`, kind: "pre-stage", name: "Trigger", steps: [] },
        { id: `st-${uuid}-1`, kind: "stage", name: "", steps: [] },
        { id: `st-${uuid}-end`, kind: "end-stage", name: "", steps: [] },
      ],
      status: "draft",
      system: false,
      trigger: { kind: "manual", label: "Manual start" },
      version: 1,
    };
    this.store.push(draft);
    return Promise.resolve(structuredClone(draft));
  };

  deleteWorkflow = (id: string): Promise<void> => {
    const index = this.store.findIndex((existing) => existing.id === id);
    if (index === -1) return Promise.reject(new Error(`Workflow ${id} not found.`));
    if (this.store[index].system)
      return Promise.reject(
        new Error("System flows cannot be deleted - restore to default instead."),
      );
    this.store.splice(index, 1);
    return Promise.resolve();
  };

  getRun = (runId: string): Promise<Run | undefined> => {
    const found = this.runStore.find((run) => run.id === runId);
    return Promise.resolve(found ? structuredClone(found) : undefined);
  };

  getWorkflow = (id: string): Promise<undefined | WorkflowDefinition> => {
    const found = this.store.find((workflow) => workflow.id === id);
    return Promise.resolve(found ? structuredClone(found) : undefined);
  };

  listAllRuns = (): Promise<Run[]> =>
    Promise.resolve(this.runStore.map((run) => structuredClone(run)).toSorted(byStartedAtDesc));

  listRuns = (workflowId: string): Promise<Run[]> =>
    Promise.resolve(
      this.runStore
        .filter((run) => run.workflowId === workflowId)
        .map((run) => structuredClone(run))
        .toSorted(byStartedAtDesc),
    );

  listWorkflows = (): Promise<WorkflowDefinition[]> =>
    Promise.resolve(this.store.map((workflow) => structuredClone(workflow)));

  restoreWorkflow = (id: string): Promise<WorkflowDefinition> => {
    const index = this.store.findIndex((existing) => existing.id === id);
    if (index === -1) return Promise.reject(new Error(`Workflow ${id} not found.`));
    if (!this.store[index].system)
      return Promise.reject(new Error("Only system flows can be restored to default."));
    const pristine = exampleSystemDefault(id);
    if (!pristine)
      return Promise.reject(new Error(`No shipped default found for system flow ${id}.`));
    // Restore resets the DEFINITION, not whether the operator disabled the flow.
    pristine.enabled = this.store[index].enabled;
    this.store[index] = structuredClone(pristine);
    return Promise.resolve(structuredClone(pristine));
  };

  saveWorkflow = (workflow: WorkflowDefinition): Promise<WorkflowDefinition> => {
    const index = this.store.findIndex((existing) => existing.id === workflow.id);
    if (index === -1) this.store.push(structuredClone(workflow));
    else this.store[index] = structuredClone(workflow);
    return Promise.resolve(structuredClone(workflow));
  };

  setWorkflowEnabled = (id: string, enabled: boolean): Promise<WorkflowDefinition> => {
    const found = this.store.find((existing) => existing.id === id);
    if (!found) return Promise.reject(new Error(`Workflow ${id} not found.`));
    found.enabled = enabled;
    return Promise.resolve(structuredClone(found));
  };

  subscribeRun = (runId: string, onUpdate: (run: Run) => void): (() => void) => {
    const found = this.runStore.find((run) => run.id === runId);
    if (!found) return (): void => {};
    return replayRun(found, onUpdate);
  };

  validateWorkflow = (workflow: WorkflowDefinition): Promise<ValidationResult> =>
    Promise.resolve(validateWorkflow(workflow));
}

/**
 * Create a fresh {@link MockWorkflowGateway} seeded with the example workflows
 * and runs. Each call returns an independent in-memory store.
 *
 * @since 1.0.0
 */
export const createMockGateway = (): MockWorkflowGateway => new MockWorkflowGateway();
