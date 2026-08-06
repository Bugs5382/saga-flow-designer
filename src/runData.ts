// Run / execution-history domain model for the Flow Designer.
//
// Mirrors the go-saga engine's RUNTIME shape: the engine executes a
// WorkflowDefinition and produces a saga run — an ordered trail of executed
// steps (StepRun), a run-level status, and an audit event log (RunEvent). Where
// the WorkflowDef is the AUTHORED shape, a Run is one concrete EXECUTION of it:
// a single resolved path through the branches.
//
// The Runs surface reads these through the same gateway seam as definitions, so
// the same UI runs against whichever data source the host wires in.

// One concrete execution of a workflow definition.
export interface Run {
  durationMs?: number; // wall-clock; absent while running/paused
  events: RunEvent[];
  finishedAt?: string; // ISO — absent while running/paused
  id: string; // saga id (short-rendered in the list)
  // The ordered ids of the steps that actually EXECUTED (the taken trail).
  // Skipped steps are NOT in the path — they only appear in stepRuns.
  path: string[];
  startedAt: string; // ISO
  status: RunStatus;
  stepRuns: StepRun[];
  trigger: RunTrigger;
  workflowId: string; // FK → WorkflowDef.id
  workflowKey: string; // denormalised for display (e.g. inc.triage)
}

// An audit-log entry: who did what, when. The engine emits these for every
// state transition (started, step completed, human decision, error, …).
export interface RunEvent {
  actor?: string; // system | a user | a group
  at: string; // ISO
  kind:
    | "cancelled"
    | "completed"
    | "decision"
    | "error"
    | "human_action"
    | "paused"
    | "resumed"
    | "started"
    | "step";
  message: string;
}

// Run-level lifecycle status. Maps to the engine's saga status.
export type RunStatus =
  "cancelled" | "failed" | "paused" | "running" | "succeeded";

// How the run was started.
export type RunTrigger = "cron" | "event" | "manual" | "record" | "replay";

// One executed (or skipped) step within a run. `stepId` ties back to the
// WorkflowDef Step.id so the canvas overlay can colour the matching card.
export interface StepRun {
  durationMs?: number; // absent while running/waiting
  // Set when status === "failed".
  error?: string;
  label: string;
  // Human-readable result payload — what the step produced.
  output?: string;
  startedAt: string; // ISO
  status: StepRunStatus;
  stepId: string;
  verb: string; // the VerbName it dispatched (for the timeline icon)
}

// Per-step execution status. `skipped` marks a step on an UNTAKEN branch (the
// path enumeration reached the decision but chose the other lane).
export type StepRunStatus =
  "failed" | "running" | "skipped" | "succeeded" | "waiting";

// --- HELPERS ---------------------------------------------------------------

// Map a StepRun by stepId, for the canvas overlay.
export const stepRunsById = (run: Run): Record<string, StepRun> =>
  Object.fromEntries(run.stepRuns.map((sr) => [sr.stepId, sr]));

// Format a duration in ms as a short human string.
export const formatDuration = (ms: number | undefined): string => {
  if (ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s % 1 === 0 ? s : s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  if (m < 60) return `${m}m${rem ? ` ${rem}s` : ""}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

// Relative "time ago" string (from a fixed NOW so seeds read stably).
const NOW = new Date("2026-07-06T18:00:00Z").getTime();

export const relativeTime = (iso: string): string => {
  const diff = NOW - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

// Absolute timestamp, compact.
export const absoluteTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });

// Short-render a saga id for the list (keep the tail, it's the entropy).
export const shortRunId = (id: string): string =>
  id.length > 12 ? `…${id.slice(-8)}` : id;
