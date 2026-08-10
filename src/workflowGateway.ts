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
import type { Run } from "./runData";
import type { WorkflowDefinition } from "./workflowData";

// Data-source seam. Pages talk to this PORT, never a data source directly, so
// the same UI runs against whichever adapter the host wires in — an in-process
// data source or a remote gateway. ONE adapter per run — no per-call fallback.

/**
 * A single validation finding against a definition, optionally tied to a step.
 *
 * @since 1.0.0
 */
export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
  stepId?: string;
}

/**
 * The outcome of validating a definition: `ok` plus the list of issues.
 *
 * @since 1.0.0
 */
export interface ValidationResult {
  issues: ValidationIssue[];
  ok: boolean;
}

/**
 * Data-source port the UI talks to for definitions and runs.
 *
 * @since 1.0.0
 */
export interface WorkflowGateway {
  // Mint a fresh draft flow (e.g. a skeleton with an empty Stage 1, or a POST of
  // an empty definition to the engine). Returns the created def so the caller
  // can navigate straight into the designer.
  createWorkflow: () => Promise<WorkflowDefinition>;
  // Hard-delete a flow. USER flows only — rejects if the flow is a system flow
  // (those are restored to default, never deleted).
  deleteWorkflow: (id: string) => Promise<void>;
  getRun: (runId: string) => Promise<Run | undefined>;
  getWorkflow: (id: string) => Promise<undefined | WorkflowDefinition>;
  // GLOBAL execution history across ALL workflows — powers the top-level Runs
  // surface. Newest-first.
  listAllRuns: () => Promise<Run[]>;
  // Execution history for ONE workflow (e.g. queried from the engine's saga
  // log). Newest-first ordering is the gateway's responsibility.
  listRuns: (workflowId: string) => Promise<Run[]>;
  listWorkflows: () => Promise<WorkflowDefinition[]>;
  // Restore a SYSTEM flow to its shipped default. Rejects if the flow is not a
  // system flow. Returns the restored def.
  restoreWorkflow: (id: string) => Promise<WorkflowDefinition>;
  // Save the whole definition (e.g. POST a new version to the engine after
  // validation).
  saveWorkflow: (workflow: WorkflowDefinition) => Promise<WorkflowDefinition>;
  // Enable/disable a flow at the trigger. A disabled flow keeps its definition
  // but never fires. Returns the updated def.
  setWorkflowEnabled: (id: string, enabled: boolean) => Promise<WorkflowDefinition>;
  // LIVE run stream. Opens the engine's per-run stream, folding each frame into
  // an updated Run and pushing it to `onUpdate` (snapshot first, then live).
  // Returns an unsubscribe that closes the transport. The reusable seam — the
  // host owns the transport.
  subscribeRun: (runId: string, onUpdate: (run: Run) => void) => () => void;
  // Static validation of a definition (structural checks).
  validateWorkflow: (workflow: WorkflowDefinition) => Promise<ValidationResult>;
}
