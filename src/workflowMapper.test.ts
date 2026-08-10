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
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { type WorkflowDefinition } from "./workflowData";
import { type EngineDefinition, expandDefinition, flattenDefinition } from "./workflowMapper";

// The REAL engine definitions (flat DAG shape) live in a TEST-ONLY fixture —
// read here via fs so nothing imports it from a production code path. It carries
// the hard cases: empty flows, a lone terminal, linear chains, and DAGs with
// convergence/merge (branches point at shared downstream steps).
const engineFixtures = JSON.parse(
  readFileSync(new URL("__engineDefs.fixture.json", import.meta.url), "utf8"),
) as EngineDefinition[];

// --- CORRECTNESS GATE -------------------------------------------------------
// normalizeGraph reduces a definition to a SET of steps keyed by id — each step
// compared by {type, action, next, branches:{case -> next}} and inputs — while
// IGNORING array order and every UI-only / designer-only field. Two definitions
// with the same normalized graph are load->save equivalent for the engine.
const normalizeGraph = (definition: EngineDefinition): Record<string, unknown> => {
  const graph: Record<string, unknown> = {};
  for (const step of definition.steps) {
    const branches: Record<string, string> = {};
    if (step.branches) {
      for (const caseLabel of Object.keys(step.branches)) {
        branches[caseLabel] = step.branches[caseLabel].next;
      }
    }
    graph[step.id] = {
      action: step.action ?? undefined,
      branches,
      inputs: { ...step.inputs },
      next: step.next ?? undefined,
      type: step.type,
    };
  }
  return graph;
};

// --- ENGINE ROUND-TRIP: load -> save fidelity on the REAL defs ---------------
// expand(engine) -> flatten -> must reproduce the SAME graph, including every
// convergence / merge case. This is the definition of done.
describe("workflowMapper engine round-trip (real defs)", () => {
  it.each(engineFixtures.map((definition) => [definition.id, definition] as const))(
    "round-trips the %s engine definition",
    (_id: string, definition: EngineDefinition) => {
      const reflattened = flattenDefinition(expandDefinition(definition));
      expect(normalizeGraph(reflattened)).toEqual(normalizeGraph(definition));
      // The engine `start` is preserved (or empty for an empty flow).
      expect(reflattened.start).toBe(definition.start ?? "");
    },
  );

  it("never crashes expanding a branches MAP and preserves convergence", () => {
    const escalate = engineFixtures.find((d) => d.id === "notif.approval_escalate_v1");
    expect(escalate).toBeDefined();
    const ui = expandDefinition(escalate as EngineDefinition);
    const flat = flattenDefinition(ui);
    const byId = new Map(flat.steps.map((s) => [s.id, s]));
    // Both approval decisions route the SAME two convergence targets.
    expect(byId.get("request_approval")?.branches).toEqual({
      approved: { next: "dispatch_approved" },
      rejected: { next: "dispatch_rejected" },
      timeout: { next: "escalate_wait" },
    });
    expect(byId.get("re_request_approval")?.branches).toEqual({
      approved: { next: "dispatch_approved" },
      rejected: { next: "dispatch_rejected" },
    });
    // Convergence steps appear EXACTLY once and both fan into `done`.
    expect(flat.steps.filter((s) => s.id === "dispatch_approved")).toHaveLength(1);
    expect(flat.steps.filter((s) => s.id === "done")).toHaveLength(1);
    expect(byId.get("dispatch_approved")?.next).toBe("done");
    expect(byId.get("dispatch_rejected")?.next).toBe("done");
    expect(byId.get("done")?.next).toBeUndefined();
  });
});

// --- UI-AUTHORING ROUND-TRIP: designer tree -> save -> reload ----------------
// A CANONICAL nested definition is a fixed point of expand(flatten(x)): non-empty
// stages, the synthesised `manual` trigger, `enabled` mirroring `published`, no
// system provenance. These prove the DESIGNER save/reload path.

// The gateway threads the storage UUID (WorkflowDefinition.id) back through expand.
const roundTrip = (definition: WorkflowDefinition): WorkflowDefinition =>
  expandDefinition(flattenDefinition(definition), definition.id);

// 1. Linear flow: pre-stage data step -> two work steps -> end-stage.
const linearFlow: WorkflowDefinition = {
  description: "A straight-line flow.",
  enabled: true,
  id: "wf-lin-1",
  key: "lin.flow",
  label: "Linear Flow",
  stages: [
    {
      id: "st-lin-pre",
      kind: "pre-stage",
      name: "Trigger",
      steps: [
        {
          config: { name: "stage", value: "'new'" },
          id: "s-lin-seed",
          label: "Seed stage var",
          type: "set_var",
        },
      ],
    },
    {
      id: "st-lin-work",
      kind: "stage",
      name: "Work",
      steps: [
        {
          config: {
            expression: "record.impact * record.urgency",
            resultVar: "x",
          },
          id: "s-lin-derive",
          label: "Derive x",
          type: "transform",
        },
        {
          config: { action: "notify", queue: "workflow.actions" },
          id: "s-lin-notify",
          label: "Notify",
          note: "let the assignee know",
          type: "action",
        },
      ],
    },
    {
      id: "st-lin-end",
      kind: "end-stage",
      name: "Close",
      steps: [
        {
          config: { name: "state", value: "'Closed'" },
          id: "s-lin-close",
          label: "Close",
          type: "set_var",
        },
      ],
    },
  ],
  status: "published",
  trigger: { kind: "manual", label: "Manual start" },
  version: 3,
};

// 2. Decision with a MERGE: the "yes" lane owns the shared convergence target
//    (page -> record outcome -> end); the "no" lane rejoins it via an explicit
//    merge. This is exactly the canonical form expand produces for a DAG whose
//    two branch paths converge on one downstream step, so it is a fixed point.
const decisionWithMerge: WorkflowDefinition = {
  description: "Routes then merges.",
  enabled: true,
  id: "wf-dm-1",
  key: "dm.flow",
  label: "Decision + Merge",
  stages: [
    {
      id: "dm-pre",
      kind: "pre-stage",
      name: "Trigger",
      steps: [
        {
          config: { name: "ok", value: "true" },
          id: "dm-seed",
          label: "Seed",
          type: "set_var",
        },
      ],
    },
    {
      id: "dm-route",
      kind: "stage",
      name: "Route",
      steps: [
        {
          branches: [
            {
              caseLabel: "yes",
              id: "dm-d::lane-0",
              steps: [
                {
                  config: { action: "pageL" },
                  id: "dm-pa",
                  label: "Page L",
                  type: "action",
                },
                {
                  config: { name: "outcome", value: "'done'" },
                  id: "dm-join",
                  label: "Record",
                  type: "set_var",
                },
                {
                  config: {},
                  id: "dm-fin",
                  label: "Done",
                  type: "end",
                },
              ],
              terminal: true,
            },
            {
              caseLabel: "no",
              id: "dm-d::lane-1",
              merge: { entryId: "dm-join", inputs: {} },
              steps: [
                {
                  config: { action: "pageR" },
                  id: "dm-pb",
                  label: "Page R",
                  type: "action",
                },
              ],
            },
          ],
          config: { condition: "vars.ok" },
          id: "dm-d",
          label: "Branch?",
          type: "decision",
        },
      ],
    },
    {
      id: "dm.flow::end",
      kind: "end-stage",
      name: "",
      steps: [],
    },
  ],
  status: "published",
  trigger: { kind: "manual", label: "Manual start" },
  version: 2,
};

describe("workflowMapper UI-authoring round-trip", () => {
  it("round-trips a linear flow", () => {
    expect(roundTrip(linearFlow)).toEqual(linearFlow);
  });

  it("round-trips a decision with a merge lane", () => {
    expect(roundTrip(decisionWithMerge)).toEqual(decisionWithMerge);
  });

  it("sets start to the first step and links the backbone via next", () => {
    const engine = flattenDefinition(linearFlow);
    expect(engine.start).toBe("s-lin-seed");
    expect(engine.id).toBe("lin.flow"); // business id
    const backbone = engine.steps.map((s) => s.id);
    expect(backbone).toEqual(["s-lin-seed", "s-lin-derive", "s-lin-notify", "s-lin-close"]);
    expect(engine.steps[0].next).toBe("s-lin-derive");
  });

  it("preserves the storage UUID and derives status/enabled from published", () => {
    const draft = { ...linearFlow, enabled: false, status: "draft" as const };
    const out = roundTrip(draft);
    expect(out.id).toBe("wf-lin-1"); // storage UUID threaded through
    expect(out.key).toBe("lin.flow"); // engine business id
    expect(out.status).toBe("draft");
    expect(out.enabled).toBe(false);
    expect(flattenDefinition(draft).published).toBe(false);
  });

  it("emits a decision's lanes as a branches MAP, not an array", () => {
    const engine = flattenDefinition(decisionWithMerge);
    const decision = engine.steps.find((s) => s.id === "dm-d");
    expect(Array.isArray(decision?.branches)).toBe(false);
    expect(decision?.branches).toEqual({
      no: { next: "dm-pb" },
      yes: { next: "dm-pa" },
    });
    expect(decision?.next).toBeUndefined();
    // The merge lane re-links its last real step's next to the merge entry.
    expect(engine.steps.find((s) => s.id === "dm-pb")?.next).toBe("dm-join");
  });
});
