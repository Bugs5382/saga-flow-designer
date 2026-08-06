import type { Run } from "./runData";
import type { WorkflowDef } from "./workflowData";

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
  createWorkflow: () => Promise<WorkflowDef>;
  // Hard-delete a flow. USER flows only — rejects if the flow is a system flow
  // (those are restored to default, never deleted).
  deleteWorkflow: (id: string) => Promise<void>;
  getRun: (runId: string) => Promise<Run | undefined>;
  getWorkflow: (id: string) => Promise<undefined | WorkflowDef>;
  // GLOBAL execution history across ALL workflows — powers the top-level Runs
  // surface. Newest-first.
  listAllRuns: () => Promise<Run[]>;
  // Execution history for ONE workflow (e.g. queried from the engine's saga
  // log). Newest-first ordering is the gateway's responsibility.
  listRuns: (workflowId: string) => Promise<Run[]>;
  listWorkflows: () => Promise<WorkflowDef[]>;
  // Restore a SYSTEM flow to its shipped default. Rejects if the flow is not a
  // system flow. Returns the restored def.
  restoreWorkflow: (id: string) => Promise<WorkflowDef>;
  // Save the whole definition (e.g. POST a new version to the engine after
  // validation).
  saveWorkflow: (workflow: WorkflowDef) => Promise<WorkflowDef>;
  // Enable/disable a flow at the trigger. A disabled flow keeps its definition
  // but never fires. Returns the updated def.
  setWorkflowEnabled: (id: string, enabled: boolean) => Promise<WorkflowDef>;
  // LIVE run stream. Opens the engine's per-run stream, folding each frame into
  // an updated Run and pushing it to `onUpdate` (snapshot first, then live).
  // Returns an unsubscribe that closes the transport. The reusable seam — the
  // host owns the transport.
  subscribeRun: (runId: string, onUpdate: (run: Run) => void) => () => void;
  // Static validation of a definition (structural checks).
  validateWorkflow: (workflow: WorkflowDef) => Promise<ValidationResult>;
}
