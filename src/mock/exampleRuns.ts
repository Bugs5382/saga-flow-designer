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

// Generic, engine-agnostic execution history that seeds the mock gateway. One
// Run is one concrete execution of an example workflow — a single resolved path
// through the branches with per-step results and an audit event log. Step ids
// here MUST match the definitions in exampleWorkflows.ts so the canvas run
// overlay can colour the matching cards. Timestamps read stably against the
// fixed NOW (2026-07-06T18:00:00Z) that runData formats against. The mock
// replays these frame-by-frame so RunDetail streams live-ish in the demo.

// --- order.fulfillment runs ------------------------------------------------

// A succeeded run down the in-stock (TRUE) lane.
const orderShipped: Run = {
  durationMs: 41_000,
  events: [
    {
      actor: "system",
      at: "2026-07-06T16:20:00Z",
      kind: "started",
      message: "Run started for order ORD-4821 (in stock).",
    },
    {
      actor: "engine",
      at: "2026-07-06T16:20:02Z",
      kind: "decision",
      message: "Decision 'In stock?' took the TRUE lane.",
    },
    {
      actor: "system",
      at: "2026-07-06T16:20:41Z",
      kind: "completed",
      message: "Run completed successfully; shipment created.",
    },
  ],
  finishedAt: "2026-07-06T16:20:41Z",
  id: "run-order-shipped-4821",
  path: [
    "s-ord-total",
    "s-ord-status",
    "s-ord-instock",
    "s-ord-reserve",
    "s-ord-shipment",
    "s-ord-complete",
    "s-ord-notify-customer",
  ],
  startedAt: "2026-07-06T16:20:00Z",
  status: "succeeded",
  stepRuns: [
    {
      durationMs: 90,
      label: "Compute order total",
      output: "vars.total = 128.5",
      startedAt: "2026-07-06T16:20:00Z",
      status: "succeeded",
      stepId: "s-ord-total",
      verb: "transform",
    },
    {
      durationMs: 30,
      label: "Set status to validating",
      output: "vars.status = 'validating'",
      startedAt: "2026-07-06T16:20:00Z",
      status: "succeeded",
      stepId: "s-ord-status",
      verb: "set_var",
    },
    {
      durationMs: 12,
      label: "In stock?",
      output: "condition TRUE -> reserve lane",
      startedAt: "2026-07-06T16:20:02Z",
      status: "succeeded",
      stepId: "s-ord-instock",
      verb: "decision",
    },
    {
      durationMs: 640,
      label: "Reserve inventory",
      output: "reserve_inventory -> 3 units held",
      startedAt: "2026-07-06T16:20:02Z",
      status: "succeeded",
      stepId: "s-ord-reserve",
      verb: "action",
    },
    // The FALSE (backorder) lane was not taken.
    {
      label: "Set status to backordered",
      output: "skipped - order was in stock",
      startedAt: "2026-07-06T16:20:02Z",
      status: "skipped",
      stepId: "s-ord-backorder",
      verb: "set_var",
    },
    {
      label: "Notify backorder",
      output: "skipped - order was in stock",
      startedAt: "2026-07-06T16:20:02Z",
      status: "skipped",
      stepId: "s-ord-notify-backorder",
      verb: "action",
    },
    {
      durationMs: 900,
      label: "Create shipment",
      output: "POST /shipments -> 201 (shipment SHP-9910)",
      startedAt: "2026-07-06T16:20:03Z",
      status: "succeeded",
      stepId: "s-ord-shipment",
      verb: "http_request",
    },
    {
      durationMs: 28,
      label: "Set status to completed",
      output: "vars.status = 'completed'",
      startedAt: "2026-07-06T16:20:40Z",
      status: "succeeded",
      stepId: "s-ord-complete",
      verb: "set_var",
    },
    {
      durationMs: 520,
      label: "Notify customer",
      output: "notify_customer -> order_shipped sent",
      startedAt: "2026-07-06T16:20:40Z",
      status: "succeeded",
      stepId: "s-ord-notify-customer",
      verb: "action",
    },
  ],
  trigger: "event",
  workflowId: "wf-order-fulfillment",
  workflowKey: "order.fulfillment",
};

// A run currently mid-flight, waiting on the shipment call.
const orderRunning: Run = {
  events: [
    {
      actor: "system",
      at: "2026-07-06T17:56:00Z",
      kind: "started",
      message: "Run started for order ORD-4830 (in stock).",
    },
    {
      actor: "engine",
      at: "2026-07-06T17:56:02Z",
      kind: "step",
      message: "Inventory reserved; creating shipment.",
    },
  ],
  id: "run-order-running-4830",
  path: ["s-ord-total", "s-ord-status", "s-ord-instock", "s-ord-reserve", "s-ord-shipment"],
  startedAt: "2026-07-06T17:56:00Z",
  status: "running",
  stepRuns: [
    {
      durationMs: 88,
      label: "Compute order total",
      output: "vars.total = 74.0",
      startedAt: "2026-07-06T17:56:00Z",
      status: "succeeded",
      stepId: "s-ord-total",
      verb: "transform",
    },
    {
      durationMs: 26,
      label: "Set status to validating",
      output: "vars.status = 'validating'",
      startedAt: "2026-07-06T17:56:00Z",
      status: "succeeded",
      stepId: "s-ord-status",
      verb: "set_var",
    },
    {
      durationMs: 10,
      label: "In stock?",
      output: "condition TRUE -> reserve lane",
      startedAt: "2026-07-06T17:56:01Z",
      status: "succeeded",
      stepId: "s-ord-instock",
      verb: "decision",
    },
    {
      durationMs: 610,
      label: "Reserve inventory",
      output: "reserve_inventory -> 1 unit held",
      startedAt: "2026-07-06T17:56:01Z",
      status: "succeeded",
      stepId: "s-ord-reserve",
      verb: "action",
    },
    {
      label: "Create shipment",
      output: "POST /shipments - awaiting response",
      startedAt: "2026-07-06T17:56:02Z",
      status: "running",
      stepId: "s-ord-shipment",
      verb: "http_request",
    },
    {
      label: "Set status to completed",
      output: "not reached - shipment in progress",
      startedAt: "2026-07-06T17:56:02Z",
      status: "skipped",
      stepId: "s-ord-complete",
      verb: "set_var",
    },
    {
      label: "Notify customer",
      output: "not reached - shipment in progress",
      startedAt: "2026-07-06T17:56:02Z",
      status: "skipped",
      stepId: "s-ord-notify-customer",
      verb: "action",
    },
  ],
  trigger: "event",
  workflowId: "wf-order-fulfillment",
  workflowKey: "order.fulfillment",
};

// --- approval.flow runs ----------------------------------------------------

// Paused at the reviewer approval gate, awaiting a human decision.
const approvalPaused: Run = {
  events: [
    {
      actor: "a.rivera",
      at: "2026-07-06T15:10:00Z",
      kind: "started",
      message: "Run started manually for DOC-118.",
    },
    {
      actor: "a.rivera",
      at: "2026-07-06T15:12:20Z",
      kind: "human_action",
      message: "Request details submitted.",
    },
    {
      actor: "engine",
      at: "2026-07-06T15:12:21Z",
      kind: "paused",
      message: "Reached reviewer gate - run paused, awaiting approval.",
    },
  ],
  id: "run-approval-paused-118",
  path: ["s-apr-collect", "s-apr-review"],
  startedAt: "2026-07-06T15:10:00Z",
  status: "paused",
  stepRuns: [
    {
      durationMs: 140_000,
      label: "Collect request details",
      output: "request_details submitted by a.rivera",
      startedAt: "2026-07-06T15:10:00Z",
      status: "succeeded",
      stepId: "s-apr-collect",
      verb: "collect_input",
    },
    {
      label: "Reviewer approval",
      output: "gate review - awaiting reviewer (due in 48h)",
      startedAt: "2026-07-06T15:12:21Z",
      status: "waiting",
      stepId: "s-apr-review",
      verb: "manual_approval",
    },
    {
      label: "Notify stakeholders",
      output: "not reached - awaiting approval",
      startedAt: "2026-07-06T15:12:21Z",
      status: "skipped",
      stepId: "s-apr-fanout",
      verb: "parallel",
    },
    {
      label: "Email owner",
      output: "not reached - awaiting approval",
      startedAt: "2026-07-06T15:12:21Z",
      status: "skipped",
      stepId: "s-apr-email",
      verb: "action",
    },
    {
      label: "Post to channel",
      output: "not reached - awaiting approval",
      startedAt: "2026-07-06T15:12:21Z",
      status: "skipped",
      stepId: "s-apr-channel",
      verb: "action",
    },
    {
      label: "Set status to approved",
      output: "not reached - awaiting approval",
      startedAt: "2026-07-06T15:12:21Z",
      status: "skipped",
      stepId: "s-apr-approved",
      verb: "set_var",
    },
    {
      label: "Log completion",
      output: "not reached - awaiting approval",
      startedAt: "2026-07-06T15:12:21Z",
      status: "skipped",
      stepId: "s-apr-log",
      verb: "log",
    },
  ],
  trigger: "manual",
  workflowId: "wf-approval-flow",
  workflowKey: "approval.flow",
};

// A fully approved run: reviewer approved, both notify trails ran, done.
const approvalDone: Run = {
  durationMs: 5_460_000,
  events: [
    {
      actor: "p.osei",
      at: "2026-07-05T09:00:00Z",
      kind: "started",
      message: "Run started manually for DOC-102.",
    },
    {
      actor: "engine",
      at: "2026-07-05T09:02:00Z",
      kind: "paused",
      message: "Reached reviewer gate - awaiting approval.",
    },
    {
      actor: "m.chen",
      at: "2026-07-05T10:30:00Z",
      kind: "human_action",
      message: "Reviewer approved the document.",
    },
    {
      actor: "engine",
      at: "2026-07-05T10:30:01Z",
      kind: "resumed",
      message: "Approval granted - notifications fanned out.",
    },
    {
      actor: "system",
      at: "2026-07-05T10:31:00Z",
      kind: "completed",
      message: "Run completed successfully; document approved.",
    },
  ],
  finishedAt: "2026-07-05T10:31:00Z",
  id: "run-approval-done-102",
  path: [
    "s-apr-collect",
    "s-apr-review",
    "s-apr-fanout",
    "s-apr-email",
    "s-apr-channel",
    "s-apr-approved",
    "s-apr-log",
  ],
  startedAt: "2026-07-05T09:00:00Z",
  status: "succeeded",
  stepRuns: [
    {
      durationMs: 118_000,
      label: "Collect request details",
      output: "request_details submitted by p.osei",
      startedAt: "2026-07-05T09:00:00Z",
      status: "succeeded",
      stepId: "s-apr-collect",
      verb: "collect_input",
    },
    {
      durationMs: 5_280_000,
      label: "Reviewer approval",
      output: "APPROVED by m.chen (reviewer)",
      startedAt: "2026-07-05T09:02:00Z",
      status: "succeeded",
      stepId: "s-apr-review",
      verb: "manual_approval",
    },
    {
      durationMs: 1200,
      label: "Notify stakeholders",
      output: "join wait-all satisfied (2/2 trails)",
      startedAt: "2026-07-05T10:30:01Z",
      status: "succeeded",
      stepId: "s-apr-fanout",
      verb: "parallel",
    },
    {
      durationMs: 480,
      label: "Email owner",
      output: "send_email -> approved sent",
      startedAt: "2026-07-05T10:30:01Z",
      status: "succeeded",
      stepId: "s-apr-email",
      verb: "action",
    },
    {
      durationMs: 360,
      label: "Post to channel",
      output: "post_message -> #approvals posted",
      startedAt: "2026-07-05T10:30:01Z",
      status: "succeeded",
      stepId: "s-apr-channel",
      verb: "action",
    },
    {
      durationMs: 24,
      label: "Set status to approved",
      output: "vars.status = 'approved'",
      startedAt: "2026-07-05T10:30:59Z",
      status: "succeeded",
      stepId: "s-apr-approved",
      verb: "set_var",
    },
    {
      durationMs: 8,
      label: "Log completion",
      output: "info: Document approved and stakeholders notified.",
      startedAt: "2026-07-05T10:31:00Z",
      status: "succeeded",
      stepId: "s-apr-log",
      verb: "log",
    },
  ],
  trigger: "manual",
  workflowId: "wf-approval-flow",
  workflowKey: "approval.flow",
};

// --- nightly.report runs ---------------------------------------------------

// A clean nightly run: gathered, rendered every region, delivered.
const reportDelivered: Run = {
  durationMs: 1_920_000,
  events: [
    {
      actor: "scheduler",
      at: "2026-07-06T02:00:00Z",
      kind: "started",
      message: "Run started on schedule (0 2 * * *).",
    },
    {
      actor: "engine",
      at: "2026-07-06T02:02:00Z",
      kind: "step",
      message: "Rendered 3 region sections.",
    },
    {
      actor: "system",
      at: "2026-07-06T02:32:00Z",
      kind: "completed",
      message: "Run completed successfully; report delivered.",
    },
  ],
  finishedAt: "2026-07-06T02:32:00Z",
  id: "run-report-delivered-0706",
  path: [
    "s-nr-fetch",
    "s-nr-cooldown",
    "s-nr-aggregate",
    "s-nr-foreach",
    "s-nr-render",
    "s-nr-email",
    "s-nr-done",
  ],
  startedAt: "2026-07-06T02:00:00Z",
  status: "succeeded",
  stepRuns: [
    {
      durationMs: 1400,
      label: "Fetch metrics",
      output: "GET /daily -> 200 (4210 rows)",
      startedAt: "2026-07-06T02:00:00Z",
      status: "succeeded",
      stepId: "s-nr-fetch",
      verb: "http_request",
    },
    {
      durationMs: 1_800_000,
      label: "Settle window",
      output: "waited PT30M",
      startedAt: "2026-07-06T02:00:02Z",
      status: "succeeded",
      stepId: "s-nr-cooldown",
      verb: "wait_duration",
    },
    {
      durationMs: 260,
      label: "Aggregate summary",
      output: "vars.summary = 3 regions rolled up",
      startedAt: "2026-07-06T02:30:02Z",
      status: "succeeded",
      stepId: "s-nr-aggregate",
      verb: "transform",
    },
    {
      durationMs: 90_000,
      label: "For each region",
      output: "3 regions iterated",
      startedAt: "2026-07-06T02:30:02Z",
      status: "succeeded",
      stepId: "s-nr-foreach",
      verb: "foreach",
    },
    {
      durationMs: 88_000,
      label: "Render region section",
      output: "render_section x3 completed",
      startedAt: "2026-07-06T02:30:02Z",
      status: "succeeded",
      stepId: "s-nr-render",
      verb: "action",
    },
    {
      durationMs: 720,
      label: "Email report",
      output: "send_email -> ops@example.com delivered",
      startedAt: "2026-07-06T02:31:58Z",
      status: "succeeded",
      stepId: "s-nr-email",
      verb: "action",
    },
    // The catch lane did not run.
    {
      label: "Log delivery error",
      output: "skipped - delivery succeeded",
      startedAt: "2026-07-06T02:31:58Z",
      status: "skipped",
      stepId: "s-nr-logerr",
      verb: "log",
    },
    {
      label: "Emit failure event",
      output: "skipped - delivery succeeded",
      startedAt: "2026-07-06T02:31:58Z",
      status: "skipped",
      stepId: "s-nr-emit",
      verb: "emit_event",
    },
    {
      durationMs: 20,
      label: "Set status to delivered",
      output: "vars.status = 'delivered'",
      startedAt: "2026-07-06T02:31:59Z",
      status: "succeeded",
      stepId: "s-nr-done",
      verb: "set_var",
    },
  ],
  trigger: "cron",
  workflowId: "wf-nightly-report",
  workflowKey: "nightly.report",
};

// A failed nightly run: the metrics fetch errored, nothing downstream ran.
const reportFailed: Run = {
  durationMs: 31_000,
  events: [
    {
      actor: "scheduler",
      at: "2026-07-05T02:00:00Z",
      kind: "started",
      message: "Run started on schedule (0 2 * * *).",
    },
    {
      actor: "engine",
      at: "2026-07-05T02:00:31Z",
      kind: "error",
      message: "Fetch metrics failed: 503 after 3 retries.",
    },
    {
      actor: "system",
      at: "2026-07-05T02:00:31Z",
      kind: "error",
      message: "Run failed - metrics source unreachable.",
    },
  ],
  finishedAt: "2026-07-05T02:00:31Z",
  id: "run-report-failed-0705",
  path: ["s-nr-fetch"],
  startedAt: "2026-07-05T02:00:00Z",
  status: "failed",
  stepRuns: [
    {
      durationMs: 31_000,
      error: "GET /daily -> 503 Service Unavailable after 3 retries (metrics source unreachable)",
      label: "Fetch metrics",
      startedAt: "2026-07-05T02:00:00Z",
      status: "failed",
      stepId: "s-nr-fetch",
      verb: "http_request",
    },
    {
      label: "Settle window",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-cooldown",
      verb: "wait_duration",
    },
    {
      label: "Aggregate summary",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-aggregate",
      verb: "transform",
    },
    {
      label: "For each region",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-foreach",
      verb: "foreach",
    },
    {
      label: "Render region section",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-render",
      verb: "action",
    },
    {
      label: "Email report",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-email",
      verb: "action",
    },
    {
      label: "Set status to delivered",
      output: "not reached - run failed upstream",
      startedAt: "2026-07-05T02:00:31Z",
      status: "skipped",
      stepId: "s-nr-done",
      verb: "set_var",
    },
  ],
  trigger: "cron",
  workflowId: "wf-nightly-report",
  workflowKey: "nightly.report",
};

/**
 * The generic example runs the mock gateway seeds its execution history from.
 *
 * @since 1.0.0
 */
export const exampleRuns: Run[] = [
  orderRunning,
  orderShipped,
  approvalPaused,
  approvalDone,
  reportDelivered,
  reportFailed,
];

/**
 * A fresh deep clone of the example runs, so a mock instance can own a mutable
 * run store without ever touching the shared seed.
 *
 * @since 1.0.0
 */
export const cloneExampleRuns = (): Run[] => structuredClone(exampleRuns);
