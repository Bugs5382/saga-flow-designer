import { describe, expect, it } from "vitest";

import { stepRunsById } from "./runData";
import {
  foldFrames,
  mapEventKind,
  mapRunState,
  mapStepStatus,
  seedRun,
  type StepResolver,
  type StreamFrame,
} from "./runStream";

// The fold is the correctness gate: a scripted engine frame sequence must fold
// into the exact Run the UI renders — status transitions, appended events,
// per-step statuses, and the taken path.

// A step resolver standing in for the loaded WorkflowDef.
const resolve: StepResolver = (stepId) =>
  stepId === "s1" ? { label: "Fetch record", verb: "record.get" } : undefined;

// saga.started → step.started(s1) → step.succeeded(s1) → run.succeeded.
const script: StreamFrame[] = [
  {
    data: {
      event_type: "saga.started",
      id: "e0",
      recorded_at: "2026-08-06T10:00:00.000Z",
      run_id: "run-1",
    },
    type: "event",
  },
  {
    data: {
      event_type: "step.started",
      from_state: "pending",
      id: "e1",
      recorded_at: "2026-08-06T10:00:01.000Z",
      run_id: "run-1",
      step_id: "s1",
      to_state: "running",
    },
    type: "event",
  },
  {
    data: {
      event_type: "step.succeeded",
      from_state: "running",
      id: "e2",
      recorded_at: "2026-08-06T10:00:03.500Z",
      run_id: "run-1",
      step_id: "s1",
      to_state: "succeeded",
    },
    type: "event",
  },
  {
    data: {
      actor: "engine",
      event_type: "run.succeeded",
      id: "e3",
      recorded_at: "2026-08-06T10:00:04.000Z",
      run_id: "run-1",
    },
    type: "event",
  },
];

describe("runStream fold", () => {
  it("folds a full happy-path run", () => {
    const run = foldFrames(seedRun("run-1"), script, resolve);

    // Terminal run status + timing.
    expect(run.status).toBe("succeeded");
    expect(run.startedAt).toBe("2026-08-06T10:00:00.000Z");
    expect(run.finishedAt).toBe("2026-08-06T10:00:04.000Z");
    expect(run.durationMs).toBe(4000);

    // Every frame appended one event, in order, with mapped kinds.
    expect(run.events.map((e) => e.kind)).toEqual([
      "started",
      "step",
      "step",
      "completed",
    ]);
    expect(run.events[3].actor).toBe("engine");
    expect(run.events[0].actor).toBe("system");
    expect(run.events[1].message).toContain("s1");
    expect(run.events[1].message).toContain("pending → running");

    // The single step resolved its label/verb and settled succeeded, with a
    // duration spanning start → success.
    const byStep = stepRunsById(run);
    expect(byStep.s1.status).toBe("succeeded");
    expect(byStep.s1.label).toBe("Fetch record");
    expect(byStep.s1.verb).toBe("record.get");
    expect(byStep.s1.durationMs).toBe(2500);

    // The taken path holds s1 exactly once (started + succeeded, deduped).
    expect(run.path).toEqual(["s1"]);
  });

  it("folds a run snapshot frame into linkage + status", () => {
    const run = foldFrames(seedRun("run-2"), [
      {
        data: {
          current_step: "s1",
          definition_id: "wf-def-uuid",
          id: "run-2",
          state: "running",
          workflow_id: "inc.triage",
        },
        type: "run",
      },
    ]);
    expect(run.status).toBe("running");
    expect(run.workflowId).toBe("wf-def-uuid");
    expect(run.workflowKey).toBe("inc.triage");
  });

  it("folds a failing step into a failed run with an error", () => {
    const run = foldFrames(seedRun("run-3"), [
      {
        data: {
          event_type: "saga.started",
          id: "e0",
          recorded_at: "2026-08-06T10:00:00.000Z",
          run_id: "run-3",
        },
        type: "event",
      },
      {
        data: {
          event_type: "step.failed",
          id: "e1",
          metadata: { error: "boom" },
          recorded_at: "2026-08-06T10:00:02.000Z",
          run_id: "run-3",
          step_id: "s9",
        },
        type: "event",
      },
      {
        data: {
          event_type: "run.failed",
          id: "e2",
          recorded_at: "2026-08-06T10:00:02.500Z",
          run_id: "run-3",
        },
        type: "event",
      },
    ]);
    expect(run.status).toBe("failed");
    // step.failed does not put the step on the taken path.
    expect(run.path).toEqual([]);
    const byStep = stepRunsById(run);
    expect(byStep.s9.status).toBe("failed");
    expect(byStep.s9.error).toBe("boom");
    // step.failed → error kind; run.failed → error kind.
    expect(run.events.map((e) => e.kind)).toEqual([
      "started",
      "error",
      "error",
    ]);
  });

  it("maps enums per the engine contract", () => {
    expect(mapRunState("pending")).toBe("running");
    expect(mapRunState("compensating")).toBe("running");
    expect(mapRunState("paused")).toBe("paused");
    expect(mapRunState("cancelled")).toBe("cancelled");

    expect(mapEventKind("saga.started")).toBe("started");
    expect(mapEventKind("step.dispatched")).toBe("step");
    expect(mapEventKind("compensation.started")).toBe("step");
    expect(mapEventKind("step.failed")).toBe("error");
    expect(mapEventKind("run.cancelled")).toBe("cancelled");
    expect(mapEventKind("license.gate.rejected")).toBe("step");

    expect(mapStepStatus("step.dispatched")).toBe("waiting");
    expect(mapStepStatus("step.started")).toBe("running");
    expect(mapStepStatus("step.succeeded")).toBe("succeeded");
    expect(mapStepStatus("step.skipped")).toBe("skipped");
    expect(mapStepStatus("saga.started")).toBeUndefined();
  });
});
