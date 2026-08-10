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
import type { WorkflowDefinition } from "../workflowData";

// Generic, engine-agnostic example workflow definitions used to seed the
// in-memory mock gateway (and, through it, the Storybook stories and the
// standalone demo app). Each definition is a plain, authored WorkflowDefinition
// in the package's UI-nested shape, so the mock hands them to the designer
// surfaces with no mapping. They exercise the common construct set — decisions,
// entry/merge rejoins, parallel fan-out, loops, and a try/catch — across three
// everyday scenarios that carry no domain-specific baggage.

// --- 1. Order fulfillment (order.fulfillment) ------------------------------
// event(order.placed) -> Validate (total + status) -> Fulfillment (in stock?
// reserve then rejoin shipping | else backorder and end) -> Shipping (create
// shipment) -> Complete (mark completed + notify customer).
const orderFulfillment: WorkflowDefinition = {
  description:
    "Fires when an order is placed: compute the total, branch on stock, reserve inventory and ship in-stock orders, or backorder the rest, then mark the order complete and notify the customer.",
  enabled: true,
  id: "wf-order-fulfillment",
  key: "order.fulfillment",
  label: "Order Fulfillment",
  stages: [
    { id: "st-ord-pre", kind: "pre-stage", name: "Trigger", steps: [] },
    {
      id: "st-ord-validate",
      kind: "stage",
      name: "Validate",
      steps: [
        {
          config: {
            expression: "record.subtotal + record.shipping",
            resultVar: "total",
          },
          id: "s-ord-total",
          label: "Compute order total",
          type: "transform",
        },
        {
          config: { name: "status", value: "'validating'" },
          id: "s-ord-status",
          label: "Set status to validating",
          type: "set_var",
        },
      ],
    },
    {
      id: "st-ord-fulfill",
      kind: "stage",
      name: "Fulfillment",
      steps: [
        {
          branches: [
            {
              caseLabel: "TRUE",
              cond: "record.in_stock == true",
              id: "b-ord-instock-true",
              merge: { entryId: "s-ord-ship-entry", inputs: {} },
              steps: [
                {
                  config: {
                    action: "reserve_inventory",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "qty": record.quantity, "sku": record.sku }',
                    queue: "workflow.actions",
                    routingKey: "action.reserve_inventory",
                  },
                  id: "s-ord-reserve",
                  label: "Reserve inventory",
                  type: "action",
                },
              ],
              // In-stock orders reserve, then rejoin the shipping entry.
              terminal: false,
            },
            {
              caseLabel: "FALSE",
              cond: "",
              id: "b-ord-instock-false",
              steps: [
                {
                  config: { name: "status", value: "'backordered'" },
                  id: "s-ord-backorder",
                  label: "Set status to backordered",
                  type: "set_var",
                },
                {
                  config: {
                    action: "notify_customer",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "template": "backorder", "to": record.customer_email }',
                    queue: "workflow.actions",
                    routingKey: "action.notify_customer",
                  },
                  id: "s-ord-notify-backorder",
                  label: "Notify backorder",
                  type: "action",
                },
              ],
              // Out-of-stock orders are backordered, then end.
              terminal: true,
            },
          ],
          config: { condition: "record.in_stock == true" },
          id: "s-ord-instock",
          label: "In stock?",
          note: "In-stock orders reserve inventory and rejoin shipping; out-of-stock orders are backordered and end.",
          type: "decision",
        },
      ],
    },
    {
      id: "st-ord-ship",
      kind: "stage",
      name: "Shipping",
      steps: [
        {
          config: { inputs: "", name: "ship" },
          id: "s-ord-ship-entry",
          label: "Shipping entry",
          note: "The in-stock lane rejoins here before the shipment is created.",
          type: "entry",
        },
        {
          config: {
            body: '{ "address": record.ship_to, "sku": record.sku }',
            method: "POST",
            resultVar: "shipment",
            url: "https://logistics.example.com/v1/shipments",
          },
          id: "s-ord-shipment",
          label: "Create shipment",
          type: "http_request",
        },
      ],
    },
    {
      id: "st-ord-end",
      kind: "end-stage",
      name: "Complete",
      steps: [
        {
          config: { name: "status", value: "'completed'" },
          id: "s-ord-complete",
          label: "Set status to completed",
          type: "set_var",
        },
        {
          config: {
            action: "notify_customer",
            connection: "amqp://broker:5672",
            inputMapping: '{ "template": "order_shipped", "to": record.customer_email }',
            queue: "workflow.actions",
            routingKey: "action.notify_customer",
          },
          id: "s-ord-notify-customer",
          label: "Notify customer",
          type: "action",
        },
      ],
    },
  ],
  status: "published",
  system: true,
  systemSource: "Examples",
  trigger: { eventType: "order.placed", kind: "event", label: "Order placed" },
  version: 3,
};

// --- 2. Document approval (approval.flow) ----------------------------------
// manual -> Submit (collect_input) -> Review (manual_approval) -> Notify
// (parallel email + channel, both rejoin) -> Done (mark approved + log).
const approvalFlow: WorkflowDefinition = {
  description:
    "A manual approval flow: collect the request details, gate on a reviewer, notify stakeholders in parallel once approved, then mark the document approved.",
  enabled: true,
  id: "wf-approval-flow",
  key: "approval.flow",
  label: "Document Approval",
  stages: [
    { id: "st-apr-pre", kind: "pre-stage", name: "Trigger", steps: [] },
    {
      id: "st-apr-submit",
      kind: "stage",
      name: "Submit",
      steps: [
        {
          config: {
            assignee: "trigger.actor",
            dueIn: "24h",
            form: "request_details",
          },
          id: "s-apr-collect",
          label: "Collect request details",
          type: "collect_input",
        },
      ],
    },
    {
      id: "st-apr-review",
      kind: "stage",
      name: "Review",
      steps: [
        {
          config: { approvers: "role == 'reviewer'", dueIn: "48h", gate: "review" },
          id: "s-apr-review",
          label: "Reviewer approval",
          type: "manual_approval",
        },
      ],
    },
    {
      id: "st-apr-notify",
      kind: "stage",
      name: "Notify",
      steps: [
        {
          children: [
            {
              caseLabel: "Email owner",
              id: "b-apr-email",
              merge: { entryId: "s-apr-notify-entry", inputs: {} },
              steps: [
                {
                  config: {
                    action: "send_email",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "template": "approved", "to": record.owner_email }',
                    queue: "workflow.actions",
                    routingKey: "action.send_email",
                  },
                  id: "s-apr-email",
                  label: "Email owner",
                  type: "action",
                },
              ],
              terminal: false,
            },
            {
              caseLabel: "Post to channel",
              id: "b-apr-channel",
              merge: { entryId: "s-apr-notify-entry", inputs: {} },
              steps: [
                {
                  config: {
                    action: "post_message",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "channel": "#approvals", "text": "Document approved" }',
                    queue: "workflow.actions",
                    routingKey: "action.post_message",
                  },
                  id: "s-apr-channel",
                  label: "Post to channel",
                  type: "action",
                },
              ],
              terminal: false,
            },
          ],
          config: { join: "wait-all" },
          id: "s-apr-fanout",
          label: "Notify stakeholders",
          type: "parallel",
        },
      ],
    },
    {
      id: "st-apr-end",
      kind: "end-stage",
      name: "Done",
      steps: [
        {
          config: { inputs: "", name: "notify" },
          id: "s-apr-notify-entry",
          label: "Notify entry",
          note: "Both notification trails rejoin here before the flow completes.",
          type: "entry",
        },
        {
          config: { name: "status", value: "'approved'" },
          id: "s-apr-approved",
          label: "Set status to approved",
          type: "set_var",
        },
        {
          config: {
            level: "info",
            message: "Document approved and stakeholders notified.",
          },
          id: "s-apr-log",
          label: "Log completion",
          type: "log",
        },
      ],
    },
  ],
  status: "draft",
  system: true,
  systemSource: "Examples",
  trigger: { kind: "manual", label: "Manual start" },
  version: 1,
};

// --- 3. Nightly report (nightly.report) ------------------------------------
// cron -> Gather (fetch + settle window + aggregate) -> Process (foreach region
// render) -> Deliver (try email | catch log + emit) -> Complete (mark
// delivered).
const nightlyReport: WorkflowDefinition = {
  description:
    "Runs on a nightly schedule: fetch the day's metrics, wait for a short settle window, aggregate a summary, render a section per region, then deliver the report with a try/catch fallback and mark it delivered.",
  enabled: true,
  id: "wf-nightly-report",
  key: "nightly.report",
  label: "Nightly Report",
  stages: [
    { id: "st-nr-pre", kind: "pre-stage", name: "Trigger", steps: [] },
    {
      id: "st-nr-gather",
      kind: "stage",
      name: "Gather",
      steps: [
        {
          config: {
            method: "GET",
            resultVar: "metrics",
            url: "https://metrics.example.com/v1/daily",
          },
          id: "s-nr-fetch",
          label: "Fetch metrics",
          type: "http_request",
        },
        {
          config: { duration: "PT30M", duration_minutes: "30" },
          id: "s-nr-cooldown",
          label: "Settle window",
          type: "wait_duration",
        },
        {
          config: { expression: "aggregate(record.regions)", resultVar: "summary" },
          id: "s-nr-aggregate",
          label: "Aggregate summary",
          type: "transform",
        },
      ],
    },
    {
      id: "st-nr-process",
      kind: "stage",
      name: "Process",
      steps: [
        {
          children: [
            {
              caseLabel: "body",
              id: "b-nr-body",
              steps: [
                {
                  config: {
                    action: "render_section",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "region": item.region }',
                    queue: "workflow.actions",
                    routingKey: "action.render_section",
                  },
                  id: "s-nr-render",
                  label: "Render region section",
                  type: "action",
                },
              ],
            },
          ],
          config: { as: "region", items: "record.regions" },
          id: "s-nr-foreach",
          label: "For each region",
          type: "foreach",
        },
      ],
    },
    {
      id: "st-nr-deliver",
      kind: "stage",
      name: "Deliver",
      steps: [
        {
          children: [
            {
              caseLabel: "Try",
              id: "b-nr-try",
              steps: [
                {
                  config: {
                    action: "send_email",
                    connection: "amqp://broker:5672",
                    inputMapping: '{ "subject": "Nightly report", "to": "ops@example.com" }',
                    queue: "workflow.actions",
                    routingKey: "action.send_email",
                  },
                  id: "s-nr-email",
                  label: "Email report",
                  type: "action",
                },
              ],
            },
            {
              caseLabel: "Catch",
              id: "b-nr-catch",
              steps: [
                {
                  config: { level: "error", message: "Report delivery failed." },
                  id: "s-nr-logerr",
                  label: "Log delivery error",
                  type: "log",
                },
                {
                  config: {
                    eventType: "report.delivery_failed",
                    payload: '{ "date": record.date }',
                  },
                  id: "s-nr-emit",
                  label: "Emit failure event",
                  type: "emit_event",
                },
              ],
            },
          ],
          config: { catchOn: "* (any error)" },
          id: "s-nr-trycatch",
          label: "Deliver report",
          type: "try_catch",
        },
      ],
    },
    {
      id: "st-nr-end",
      kind: "end-stage",
      name: "Complete",
      steps: [
        {
          config: { name: "status", value: "'delivered'" },
          id: "s-nr-done",
          label: "Set status to delivered",
          type: "set_var",
        },
      ],
    },
  ],
  status: "published",
  system: false,
  trigger: { kind: "cron", label: "Nightly at 02:00", schedule: "0 2 * * *" },
  version: 2,
};

/**
 * The generic example workflow definitions the mock gateway seeds from.
 *
 * @since 1.0.0
 */
export const exampleWorkflows: WorkflowDefinition[] = [
  orderFulfillment,
  approvalFlow,
  nightlyReport,
];

/**
 * A fresh deep clone of the example workflows, so a mock instance can own a
 * mutable store without ever touching the shared seed.
 *
 * @since 1.0.0
 */
export const cloneExampleWorkflows = (): WorkflowDefinition[] => structuredClone(exampleWorkflows);

// Pristine shipped definition per system-flow id, frozen at module load off the
// untouched seed so a live edit in a mock store can never mutate the baseline.
const systemDefaultsById: Record<string, WorkflowDefinition> = Object.fromEntries(
  exampleWorkflows
    .filter((workflow) => workflow.system)
    .map((workflow) => [workflow.id, structuredClone(workflow)]),
);

/**
 * A fresh clone of the shipped default for a system flow, or undefined if the
 * id is not a known system flow. Powers the mock's "restore to default".
 *
 * @since 1.0.0
 */
export const exampleSystemDefault = (id: string): undefined | WorkflowDefinition => {
  const def = systemDefaultsById[id];
  return def ? structuredClone(def) : undefined;
};
