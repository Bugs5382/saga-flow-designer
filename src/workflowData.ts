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
// Workflow domain model + verb catalog for the Flow Designer.
//
// This mirrors the go-saga engine's WorkflowDefinition shape
// (go-saga-orchestration/domain/definition.go). The real engine
// stores a flat step list keyed by id with `next`/`branches`; for the DESIGNER
// we keep a friendlier nested tree (branches/children carry their own step
// arrays) so the canvas can render lanes without re-walking a graph.
//
// A workflow is an ordered list of STAGES. Three kinds:
//   - pre-stage  : exactly one, always at top, holds the trigger.
//   - stage      : numbered/named work stages, 1..N.
//   - end-stage  : exactly one, always at bottom, holds the End terminal and
//                  may hold trailing nodes (e.g. close + notify).
// Each stage holds an ordered `steps` sequence (the step nodes).
// The gateway seam is where a real flatten/expand mapper lives.

/**
 * A branch lane inside a decision/switch step, or a child lane inside
 * parallel/foreach/while/try_catch. `caseLabel` is the human label (e.g. "TRUE"
 * / "P1"), `cond` a CEL-ish expression (empty = default/else).
 *
 * TERMINATION MODEL (control-flow redesign):
 *   Every lane DEFAULTS TO END (terminal). There is NO implicit fall-through or
 *   auto-rejoin — merging back is always an explicit choice, even for parallel.
 *   * `terminal` — undefined = use the owner-type default (laneDefaultsTerminal).
 *     A terminal lane truly ENDS on its own end-cap; control does not flow out
 *     of it into a sibling, a join, or the main flow.
 *   * `merge` — set on a NON-terminal decision/switch/parallel/join lane: the
 *     explicit sub-entry point it rejoins to + the data contract it supplies.
 *     Required whenever such a lane is non-terminal (validated).
 *   EXCEPTIONS (loops): a foreach/while body lane and a try_catch TRY lane
 *   default to REJOIN (loop back / continue) rather than end — see
 *   laneDefaultsTerminal / laneSemantics. A try_catch CATCH lane is ALWAYS
 *   terminal (forced, non-configurable).
 *
 * @since 1.0.0
 */
export interface Branch {
  caseLabel: string;
  cond?: string;
  id: string;
  merge?: MergeTarget;
  steps: Step[];
  terminal?: boolean;
}

/**
 * Where a rejoining (non-terminal) lane merges back to. A merge is ALWAYS
 * explicit — there is no implicit fall-through / auto-rejoin. It targets a
 * specific entry-point node (`entryId`, an `entry` verb's step id) and supplies
 * a data mapping fulfilling that entry's declared input contract:
 *   inputs[<entry-declared-name>] = <CEL / pill expression the lane provides>.
 *
 * @since 1.0.0
 */
export interface MergeTarget {
  entryId: string;
  inputs: Record<string, string>;
}

/**
 * A field of a record type, in scope as a pill under record.<name>.
 *
 * @since 1.0.0
 */
export interface RecordField {
  label: string;
  name: string;
  type: string;
}

/**
 * An ordered section of a workflow holding a sequence of steps.
 *
 * @since 1.0.0
 */
export interface Stage {
  id: string;
  kind: StageKind;
  name: string;
  steps: Step[];
}

/**
 * The kind of a stage: the pre-stage, a work stage, or the end-stage.
 *
 * @since 1.0.0
 */
export type StageKind = "end-stage" | "pre-stage" | "stage";

/**
 * A single node. `config` is the per-verb inputs bag (maps to engine
 * Step.Inputs). decision/switch use `branches`; parallel/foreach/while/try_catch
 * use `children` (each child is a lane = its own step sequence).
 *
 * @since 1.0.0
 */
export interface Step {
  branches?: Branch[];
  children?: Branch[];
  // Collapse state of a decision/switch/parallel/foreach subtree (persisted in
  // the working copy). Default: expanded (undefined | false).
  collapsed?: boolean;
  config: Record<string, string>;
  id: string;
  label: string;
  // Author rationale — documentation only, not executed. Rendered as a note
  // indicator on the card + a textarea in the config panel.
  note?: string;
  type: VerbName;
}

/**
 * What starts a workflow: the trigger kind and its parameters.
 *
 * @since 1.0.0
 */
export interface Trigger {
  eventType?: string;
  fromState?: string;
  kind: TriggerKind;
  label: string;
  // record: recordType + fromState/toState; cron: schedule; event: eventType.
  recordType?: string;
  schedule?: string;
  toState?: string;
}

/**
 * How a workflow is triggered.
 *
 * @since 1.0.0
 */
export type TriggerKind = "cron" | "event" | "manual" | "record";

/**
 * A config field descriptor that drives the RIGHT-hand node config form.
 *
 * @since 1.0.0
 */
export interface VerbField {
  // For expression fields: insertable CEL example snippets shown under the
  // editor (click to insert) so it's obvious you can compute/calc here.
  examples?: string[];
  key: string;
  kind: "expression" | "number" | "select" | "text" | "textarea";
  label: string;
  options?: string[];
  // If true, the field accepts a pill reference and gets a pill picker.
  pillable?: boolean;
  placeholder?: string;
}

/**
 * The palette group a verb belongs to.
 *
 * @since 1.0.0
 */
export type VerbGroup =
  | "Actions"
  | "Boundary"
  | "Control"
  | "Data"
  | "Events"
  | "Flow"
  | "Human"
  | "Ops"
  | "Signals"
  | "Waits";

/**
 * The verbs the engine can dispatch (engine/verbs/registry.go), plus three
 * first-class BOUNDARY verbs the designer places explicitly:
 *   - end   : normal successful completion of a trail (terminal).
 *   - cancel: cancel the saga — abort + compensation semantics (terminal).
 *   - entry : an entry point that declares a data contract; a rejoining lane
 *             (merge target) must target an entry and supply its declared inputs.
 *
 * @since 1.0.0
 */
export type VerbName =
  | "action"
  | "assert"
  | "cancel"
  | "collect_input"
  | "decision"
  | "emit_event"
  | "emit_signal"
  | "end"
  | "entry"
  | "error"
  | "filter"
  | "foreach"
  | "http_request"
  | "join"
  | "log"
  | "manual_approval"
  | "map"
  | "merge"
  | "metric_emit"
  | "noop"
  | "parallel"
  | "set_var"
  | "spawn_saga"
  | "sub_saga"
  | "switch"
  | "transform"
  | "try_catch"
  | "wait_duration"
  | "wait_for_event"
  | "wait_for_signal"
  | "wait_until"
  | "webhook"
  | "while";

/**
 * Where a verb comes from: a base go-saga verb, or a registered 3rd-party
 * extension contributed by a vendor plug-in.
 *
 * @since 1.0.0
 */
export type VerbSource = "base" | "third_party";

/**
 * The catalog entry for a verb: palette metadata plus its config fields.
 *
 * @since 1.0.0
 */
export interface VerbSpec {
  // Catalog metadata surfaced in the palette ⓘ info dialog.
  description: string;
  fields: VerbField[];
  group: VerbGroup;
  icon: string;
  inputs: string;
  label: string;
  name: VerbName;
  outputs: string;
  source: VerbSource;
  summary: string;
  // Only set for third_party verbs.
  vendor?: string;
}

/**
 * The authored workflow definition: stages, trigger, lifecycle, and metadata.
 *
 * @since 1.0.0
 */
export interface WorkflowDefinition {
  description?: string;
  // A disabled flow keeps its definition but never fires. Toggled at the
  // trigger. Undefined is treated as enabled (back-compat with older defs).
  enabled?: boolean;
  id: string;
  key: string;
  label: string;
  stages: Stage[];
  status: WorkflowStatus;
  // --- LIFECYCLE ------------------------------------------------------------
  // A SYSTEM flow ships with a Base / Base-Plus / Domain / 3rd-party system.
  // System flows can be modified, disabled, and restored to their shipped
  // default — but NEVER deleted. USER flows (system falsy) can be deleted.
  system?: boolean;
  // Which system shipped it — e.g. "ITIL" (Domain). Display-only provenance.
  systemSource?: string;
  trigger: Trigger;
  version: number;
}

// --- RECORD-TYPE INTROSPECTION ---------------------------------------------
// Example field lists per record type — the trigger's record type declares which
// record fields are in scope as pills (record.<field>). A host build would pull
// these from its record schema registry via the gateway.

/**
 * The publishing lifecycle status of a workflow.
 *
 * @since 1.0.0
 */
export type WorkflowStatus = "archived" | "draft" | "published";

/**
 * Example field lists per record type — the trigger's record type declares
 * which record fields are in scope as pills (record.<field>). A host build
 * would pull these from its record schema registry via the gateway.
 *
 * @since 1.0.0
 */
export const RECORD_TYPES: Record<string, { fields: RecordField[]; label: string }> = {
  change: {
    fields: [
      { label: "Change number", name: "number", type: "string" },
      { label: "Short description", name: "short_description", type: "string" },
      { label: "Type (standard/normal/emergency)", name: "type", type: "enum" },
      { label: "Risk", name: "risk", type: "enum" },
      { label: "Impact", name: "impact", type: "enum" },
      { label: "State", name: "state", type: "enum" },
      { label: "Requested by", name: "requested_by", type: "ref" },
      { label: "Assignment group", name: "assignment_group", type: "ref" },
      { label: "CAB required", name: "cab_required", type: "bool" },
      { label: "Change tasks", name: "tasks", type: "array" },
      { label: "Planned start", name: "planned_start", type: "datetime" },
    ],
    label: "Change",
  },
  incident: {
    fields: [
      { label: "Incident number", name: "number", type: "string" },
      { label: "Short description", name: "short_description", type: "string" },
      { label: "Impact (1-3)", name: "impact", type: "enum" },
      { label: "Urgency (1-3)", name: "urgency", type: "enum" },
      { label: "Priority (P1-P4)", name: "priority", type: "enum" },
      { label: "State", name: "state", type: "enum" },
      { label: "Caller", name: "caller", type: "ref" },
      { label: "Assigned to", name: "assigned_to", type: "ref" },
      { label: "Assignment group", name: "assignment_group", type: "ref" },
      { label: "Category", name: "category", type: "enum" },
    ],
    label: "Incident",
  },
  request: {
    fields: [
      { label: "Request number", name: "number", type: "string" },
      { label: "Short description", name: "short_description", type: "string" },
      { label: "Requested for", name: "requested_for", type: "ref" },
      { label: "Requested by", name: "requested_by", type: "ref" },
      { label: "Catalog item", name: "item", type: "ref" },
      { label: "State", name: "state", type: "enum" },
      { label: "Approval", name: "approval", type: "enum" },
      { label: "Fulfillment group", name: "fulfillment_group", type: "ref" },
      { label: "Requester's manager", name: "manager", type: "ref" },
    ],
    label: "Service Request",
  },
};

// --- VERB CATALOG -----------------------------------------------------------
/**
 * The base verb catalog. Data-driven so the LEFT palette + RIGHT config form +
 * ⓘ info dialog render from one source. Field sets approximate each verb's
 * Inputs shape.
 *
 * @since 1.0.0
 */
export const VERB_CATALOG: VerbSpec[] = [
  // Boundary (entry / terminals) ---------------------------------------------
  // Grouped at the TOP: the endpoints of a trail. Entry declares a data
  // contract; End and Cancel are DISTINCT terminals.
  {
    description:
      "A named entry point (sub-entry) into the flow. It DECLARES a data contract — the inputs any lane that merges/rejoins here MUST supply. Loops render an entry node at the body head that iterations rejoin. Author the contract as a comma-separated list of input names; a merging lane maps each to a value.",
    fields: [
      { key: "name", kind: "text", label: "Entry name", placeholder: "resume" },
      {
        key: "inputs",
        kind: "text",
        label: "Declared inputs (comma-separated)",
        placeholder: "result, count",
      },
    ],
    group: "Boundary",
    icon: "🎯",
    inputs: "declared input names (contract)",
    label: "Entry",
    name: "entry",
    outputs: "entry.<name> for each declared input",
    source: "base",
    summary: "An entry point that declares a data contract for rejoining lanes.",
  },
  {
    description:
      "Ends this trail with NORMAL, successful completion. Terminal — nothing runs after it on its trail. Distinct from Cancel: End is the happy-path finish, Cancel aborts with compensation.",
    fields: [],
    group: "Boundary",
    icon: "⬛",
    inputs: "—",
    label: "End",
    name: "end",
    outputs: "trail completed (terminal)",
    source: "base",
    summary: "Normal successful completion of this trail (terminal).",
  },
  {
    description:
      "Cancels the run (or a named sub-saga) and triggers COMPENSATION (abort semantics). Terminal — nothing runs after it on its trail. Distinct from End: End is normal success; Cancel unwinds already-completed work.",
    fields: [
      { key: "target", kind: "text", label: "Target", placeholder: "self" },
      { key: "reason", kind: "text", label: "Reason" },
    ],
    group: "Boundary",
    icon: "🛑",
    inputs: "target, reason",
    label: "Cancel",
    name: "cancel",
    outputs: "run cancelled + compensated (terminal)",
    source: "base",
    summary: "Cancel the saga (abort + compensation) — a terminal, distinct from End.",
  },

  // Control ------------------------------------------------------------------
  {
    description:
      "Evaluates a boolean CEL condition and routes down the TRUE or FALSE lane. Each lane is its own trail: it either rejoins the main flow below the decision or terminates on its own end.",
    fields: [
      {
        examples: [
          "record.priority == 'P1'",
          "record.reopen_count > 3",
          "vars.score >= 80",
          "record.impact * record.urgency <= 2",
        ],
        key: "condition",
        kind: "expression",
        label: "Condition (CEL)",
        pillable: true,
        placeholder: "record.priority == 'P1'",
      },
    ],
    group: "Control",
    icon: "🔀",
    inputs: "condition (boolean CEL)",
    label: "Decision",
    name: "decision",
    outputs: "control → matched lane",
    source: "base",
    summary: "Two-way branch on a boolean condition (true / false lanes).",
  },
  {
    description:
      "Evaluates an expression and routes down the first case lane whose value matches, else the default lane. Each case lane is an independent trail.",
    fields: [
      {
        key: "on",
        kind: "expression",
        label: "Switch on (CEL)",
        pillable: true,
        placeholder: "record.category",
      },
    ],
    group: "Control",
    icon: "🎚️",
    inputs: "on (CEL) + per-case match values",
    label: "Switch",
    name: "switch",
    outputs: "control → matched case lane",
    source: "base",
    summary: "N-way branch: one lane per matching case, plus a default lane.",
  },
  {
    description:
      "Fans out into N independent branch trails that run concurrently. Each branch is an isolated trail — control never flows from one branch into a sibling. There is NO intrinsic join: every branch DEFAULTS TO END. Merging is an explicit, per-branch choice — a non-terminal branch names an entry point to rejoin and supplies its data contract. The join policy (wait-all / quorum N-of-M / aggregate) governs how the merging branches reconvene at their shared entry. Parallels may nest. To combine branch DATA into one value, use a merge verb after the entry.",
    fields: [
      {
        key: "join",
        kind: "select",
        label: "Join policy",
        options: ["wait-all", "quorum", "aggregate"],
      },
      {
        key: "quorum",
        kind: "number",
        label: "Quorum N (quorum only)",
        placeholder: "2",
      },
      {
        key: "resultVar",
        kind: "text",
        label: "Aggregate result var (aggregate only)",
        placeholder: "branchResults",
      },
    ],
    group: "Control",
    icon: "🪢",
    inputs: "child branch trails; join policy (for merging branches)",
    label: "Parallel",
    name: "parallel",
    outputs: "control resumes at the merged entry; aggregate → resultVar",
    source: "base",
    summary: "Fan out into concurrent branch trails; each ends or explicitly merges.",
  },
  {
    description:
      "A barrier that reconvenes streams an earlier step spawned INDEPENDENTLY (e.g. fire-and-forget spawn_saga children) before the run continues. Where parallel joins only its own direct branches, join waits on the children of a named set of upstream steps. Resolves per a strategy: wait for all watched children (default), or a quorum N. Aggregates their outputs into the run, then the main flow continues below. (go-saga v0.6.0.)",
    fields: [
      {
        examples: ["['spawn-audit', 'spawn-notify']"],
        key: "streams",
        kind: "expression",
        label: "Streams (upstream step IDs, CEL)",
        pillable: true,
        placeholder: "['spawn-audit', 'spawn-notify']",
      },
      {
        key: "join_strategy",
        kind: "select",
        label: "Join strategy",
        options: ["all", "quorum"],
      },
      {
        key: "quorum_n",
        kind: "number",
        label: "Quorum N (quorum only)",
        placeholder: "2",
      },
    ],
    group: "Control",
    icon: "⛓️",
    inputs: "streams (upstream step IDs); join strategy",
    label: "Join",
    name: "join",
    outputs: "control resumes; aggregate → vars._join.<id>.branches",
    source: "base",
    summary: "Barrier: wait on independently-spawned streams, then merge back.",
  },
  {
    description:
      "Iterates a collection, running the body lane once per item with the item bound to a variable. The body defaults to REJOIN — it loops back to the loop's entry node (rendered at the body head) each item. Bounded by the collection size.",
    fields: [
      {
        key: "items",
        kind: "expression",
        label: "Items (CEL)",
        pillable: true,
        placeholder: "record.tasks",
      },
      { key: "as", kind: "text", label: "Item var", placeholder: "task" },
    ],
    group: "Control",
    icon: "🔁",
    inputs: "items (collection CEL), as (item var)",
    label: "For Each",
    name: "foreach",
    outputs: "control → body lane per item",
    source: "base",
    summary: "Run the body once per item; the body loops back (rejoins).",
  },
  {
    description:
      "Repeats the body lane while a CEL condition holds. The body defaults to REJOIN — it loops back to the loop's entry node each iteration (rendered at the body head). A guardrail max-iterations bounds the loop (defaults to 50 when unset).",
    fields: [
      {
        key: "condition",
        kind: "expression",
        label: "Condition (CEL)",
        pillable: true,
        placeholder: "vars.retries < 3",
      },
      {
        key: "maxIterations",
        kind: "number",
        label: "Max iterations (guardrail, default 50)",
        placeholder: "50",
      },
    ],
    group: "Control",
    icon: "🔂",
    inputs: "condition (CEL), maxIterations (default 50)",
    label: "While",
    name: "while",
    outputs: "control → body lane repeatedly",
    source: "base",
    summary: "Repeat the body while a condition holds; the body loops back (rejoins).",
  },
  {
    description:
      "Renders as two side-by-side columns: TRY and CATCH. Runs the try lane; if it raises an error, runs the catch lane for recovery or compensation. The TRY lane may rejoin OR end (defaults to REJOIN — continue after the try). The CATCH lane ALWAYS ends (forced terminal, not configurable).",
    fields: [
      {
        key: "catchOn",
        kind: "text",
        label: "Catch on",
        placeholder: "* (any error)",
      },
    ],
    group: "Control",
    icon: "🛟",
    inputs: "catchOn (error matcher)",
    label: "Try / Catch",
    name: "try_catch",
    outputs: "control → try, then catch on error",
    source: "base",
    summary: "Two columns — Try | Catch. Try defaults to rejoin; Catch always ends.",
  },

  // Actions ------------------------------------------------------------------
  {
    // ACTION = RabbitMQ dispatch ONLY. HTTP calls are the separate http_request
    // verb — the two are deliberately distinct (see #96). An action publishes a
    // mapped payload onto a queue via a routing key; a worker consumes it.
    description:
      "Dispatches a registered action handler by PUBLISHING to RabbitMQ (AMQP). Names the action verb, the publisher/connection, the target queue + routing key, and a mapped input payload. HTTP calls are a separate verb (HTTP Request) — Action is RabbitMQ-only.",
    fields: [
      {
        key: "action",
        kind: "text",
        label: "Registered verb",
        placeholder: "notify",
      },
      {
        key: "connection",
        kind: "text",
        label: "Publisher / connection URL",
        placeholder: "amqp://rabbitmq:5672",
      },
      {
        key: "queue",
        kind: "text",
        label: "Queue",
        placeholder: "workflow.actions",
      },
      {
        key: "routingKey",
        kind: "text",
        label: "Routing key",
        placeholder: "action.notify",
      },
      {
        key: "inputMapping",
        kind: "textarea",
        label: "Input mapping (JSON/CEL)",
        pillable: true,
        placeholder: '{ "to": "on-call" }',
      },
    ],
    group: "Actions",
    icon: "⚡",
    inputs: "action (verb), connection, queue, routingKey, inputMapping",
    label: "Action",
    name: "action",
    outputs: "action result (optional)",
    source: "base",
    summary: "Publish a registered action to RabbitMQ (notify, assign, escalate, …).",
  },
  {
    description:
      "Makes an outbound HTTP call and captures the response into a workflow variable. Distinct from Action (which publishes to RabbitMQ) — HTTP Request is the synchronous request/response transport. Use the Test query button to preview the call in the designer.",
    fields: [
      {
        key: "method",
        kind: "select",
        label: "Method",
        options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
      {
        key: "url",
        kind: "text",
        label: "URL",
        placeholder: "https://api.example.com/v1/…",
      },
      {
        key: "body",
        kind: "textarea",
        label: "Body (JSON/CEL)",
        pillable: true,
      },
      {
        key: "resultVar",
        kind: "text",
        label: "Result var",
        placeholder: "response",
      },
    ],
    group: "Actions",
    icon: "🌐",
    inputs: "method, url, body",
    label: "HTTP Request",
    name: "http_request",
    outputs: "resultVar (response)",
    source: "base",
    summary: "Call an external HTTP endpoint; capture the response into a var.",
  },
  {
    description:
      "POSTs a payload to a configured outbound webhook registration. Use the Test connection button to preview a delivery in the designer.",
    fields: [
      {
        key: "webhook",
        kind: "text",
        label: "Webhook ref / URL",
        placeholder: "https://hooks.example.com/…",
      },
      {
        key: "payload",
        kind: "textarea",
        label: "Payload (JSON/CEL)",
        pillable: true,
      },
    ],
    group: "Actions",
    icon: "📤",
    inputs: "webhook (ref / URL), payload",
    label: "Webhook",
    name: "webhook",
    outputs: "delivery ack",
    source: "base",
    summary: "POST a payload to a configured outbound webhook.",
  },

  // Waits --------------------------------------------------------------------
  {
    description:
      "Suspends the run for a fixed relative duration, then resumes. Authored as a structured combo (years/months/weeks/days/hours/minutes/seconds); the total is capped at 365 days. The composed value is stored as an ISO-8601 duration.",
    // The `duration` field is COMPOSED from the structured combo (see the
    // wait_duration branch in NodeConfigPanel); it is not a free-text input.
    fields: [
      {
        key: "duration",
        kind: "text",
        label: "Duration",
        placeholder: "P1DT2H",
      },
    ],
    group: "Waits",
    icon: "⏳",
    inputs: "duration (ISO-8601, ≤ 365 days)",
    label: "Wait Duration",
    name: "wait_duration",
    outputs: "control (after delay)",
    source: "base",
    summary: "Pause the run for a fixed duration (up to 365 days).",
  },
  {
    description:
      "Suspends the run until a target time. Two modes: (a) an ABSOLUTE datetime from a pill / CEL expression, or (b) a RELATIVE offset (years…seconds combo, ≤ 365 days) computed at execution time.",
    // `mode` selects absolute (uses `until`) vs relative (uses the combo). The
    // combo + mode UI live in the wait_until branch of NodeConfigPanel.
    fields: [
      {
        key: "until",
        kind: "expression",
        label: "Until (CEL / ISO)",
        pillable: true,
        placeholder: "record.planned_start",
      },
    ],
    group: "Waits",
    icon: "📅",
    inputs: "mode; until (CEL / ISO) OR relative offset",
    label: "Wait Until",
    name: "wait_until",
    outputs: "control (at time)",
    source: "base",
    summary: "Pause until an absolute timestamp, or a relative offset from now.",
  },

  // Signals ------------------------------------------------------------------
  // emit_signal + wait_for_signal are the matched signal pair, kept adjacent.
  {
    description:
      "Sends a named signal to another run or self — the counterpart to wait_for_signal.",
    fields: [
      { key: "signal", kind: "text", label: "Signal name" },
      {
        key: "target",
        kind: "text",
        label: "Target run",
        placeholder: "sagaId",
      },
    ],
    group: "Signals",
    icon: "📳",
    inputs: "signal (name), target run",
    label: "Emit Signal",
    name: "emit_signal",
    outputs: "signal delivered",
    source: "base",
    summary: "Send a signal to another run (or self).",
  },
  {
    description:
      "Blocks until a named signal is delivered to this run. Requires an emit_signal somewhere that can deliver it (self or another run).",
    fields: [
      {
        key: "signal",
        kind: "text",
        label: "Signal name",
        placeholder: "approval.granted",
      },
      { key: "timeout", kind: "text", label: "Timeout", placeholder: "24h" },
    ],
    group: "Signals",
    icon: "📶",
    inputs: "signal (name), timeout",
    label: "Wait for Signal",
    name: "wait_for_signal",
    outputs: "signal payload",
    source: "base",
    summary: "Block until a named signal is delivered to this run.",
  },

  // Events -------------------------------------------------------------------
  // emit_event + wait_for_event mirror the signal pair, kept adjacent. Signals
  // and Events are two DISTINCT, adjacent groups.
  {
    description:
      "Publishes a domain event onto the bus for other runs / subscribers — the counterpart to wait_for_event.",
    fields: [
      { key: "eventType", kind: "text", label: "Event type" },
      {
        key: "payload",
        kind: "textarea",
        label: "Payload (JSON/CEL)",
        pillable: true,
      },
    ],
    group: "Events",
    icon: "📡",
    inputs: "eventType, payload",
    label: "Emit Event",
    name: "emit_event",
    outputs: "event published",
    source: "base",
    summary: "Publish a domain event onto the bus.",
  },
  {
    description:
      "Blocks until a matching domain event is observed on the bus — the counterpart to emit_event.",
    fields: [
      {
        key: "eventType",
        kind: "text",
        label: "Event type",
        placeholder: "record.updated",
      },
      {
        key: "match",
        kind: "expression",
        label: "Match (CEL)",
        pillable: true,
      },
    ],
    group: "Events",
    icon: "🛰️",
    inputs: "eventType, match (CEL)",
    label: "Wait for Event",
    name: "wait_for_event",
    outputs: "matched event",
    source: "base",
    summary: "Block until a matching domain event is observed.",
  },

  // Human --------------------------------------------------------------------
  {
    description:
      "Pauses for a human decision gate assigned to a User, Group, or record-relative approver. Fans out three outcome lanes — Approved (continues), Rejected, and Timed-out. Decision rule is single / quorum N / unanimous. An optional pre-breach escalation notifies or reassigns before the due date routes to Timed-out.",
    fields: [{ key: "dueIn", kind: "text", label: "Due in", placeholder: "48h" }],
    group: "Human",
    icon: "🧑‍⚖️",
    inputs: "approvers (target), rule, dueIn, escalation",
    label: "Manual Approval",
    name: "manual_approval",
    outputs: "vars.<id>.{decision, decidedBy, decidedAt, comment}",
    source: "base",
    summary: "Human gate; fans out Approved / Rejected / Timed-out lanes.",
  },
  {
    description:
      'Pauses and requests structured input from a person via a form. Form source is either a pre-authored form reference (formRef, e.g. "pir_review@2") or a set of inline fields defined in the step config. Fans out two outcome lanes — Submitted (continues, non-terminal) and Timed-out (terminal). An optional pre-breach escalation notifies or reassigns before the due date routes to Timed-out.',
    fields: [{ key: "dueIn", kind: "text", label: "Due in", placeholder: "24h" }],
    group: "Human",
    icon: "📝",
    inputs: "formRef OR inlineFields (JSON InlineField[]), assignee (target), dueIn, escalation",
    label: "Collect Input",
    name: "collect_input",
    outputs:
      "vars.<id>.<field> per inline field (or vars.<id> placeholder for formRef); vars.<id>.submittedBy; vars.<id>.submittedAt",
    source: "base",
    summary: "Human form gate; fans out Submitted / Timed-out lanes.",
  },

  // Data ---------------------------------------------------------------------
  {
    description:
      "Assigns one or MANY computed values / literals into workflow variables — commonly the record state (e.g. set state → Resolved). Each assignment is a {name, value} row; every declared name becomes a downstream pill.",
    // set_var stores its rows as a JSON string in config.assignments (see
    // setVariableAssignments / serializeAssignments). The legacy single {name,value}
    // pair is still read for back-compat; the repeatable editor lives in
    // NodeConfigPanel. These field descriptors drive back-compat / single-row
    // reads only — the panel renders the multi-row editor.
    fields: [
      { key: "name", kind: "text", label: "Variable", placeholder: "state" },
      {
        examples: [
          "record.impact * record.urgency",
          "vars.count + 1",
          "'Resolved'",
          "record.cost * 1.08",
        ],
        key: "value",
        kind: "expression",
        label: "Value (CEL / literal)",
        pillable: true,
        placeholder: "'Resolved'",
      },
    ],
    group: "Data",
    icon: "🏷️",
    inputs: "assignments [{ name, value (CEL / literal) }]",
    label: "Set Var",
    name: "set_var",
    outputs: "vars.<name> for each assignment",
    source: "base",
    summary: "Assign one or many workflow variables.",
  },
  {
    description:
      "Computes a SINGLE new value from existing pills/vars via a CEL expression (one input scope → one output var). E.g. derive priority from impact × urgency.",
    fields: [
      { key: "resultVar", kind: "text", label: "Result var" },
      {
        examples: [
          "record.impact * record.urgency",
          "(record.cost * 1.08)",
          "size(record.tasks)",
          "record.reopen_count + 1",
        ],
        key: "expression",
        kind: "expression",
        label: "Expression (CEL)",
        pillable: true,
      },
    ],
    group: "Data",
    icon: "🧬",
    inputs: "expression (CEL)",
    label: "Transform",
    name: "transform",
    outputs: "resultVar",
    source: "base",
    summary: "Compute a new value from existing vars via an expression.",
  },
  {
    description: "Merges multiple objects or branch outputs into a single variable.",
    fields: [
      {
        key: "sources",
        kind: "expression",
        label: "Sources (CEL[])",
        pillable: true,
      },
      { key: "resultVar", kind: "text", label: "Result var" },
    ],
    group: "Data",
    icon: "🧩",
    inputs: "sources (CEL[])",
    label: "Merge",
    name: "merge",
    outputs: "resultVar",
    source: "base",
    summary: "Merge objects / branch outputs into one var.",
  },
  {
    description:
      "Filters a collection by a predicate. Mode KEEP keeps the matching items (normal); mode DROP removes them (inverse). Authored via the condition builder (raw-CEL escape hatch available).",
    // `mode` = "keep" (default) | "drop". The predicate uses the ConditionBuilder.
    fields: [
      {
        key: "items",
        kind: "expression",
        label: "Items (CEL)",
        pillable: true,
      },
      {
        key: "predicate",
        kind: "expression",
        label: "Predicate (CEL)",
        pillable: true,
      },
      { key: "mode", kind: "select", label: "Mode", options: ["keep", "drop"] },
      { key: "resultVar", kind: "text", label: "Result var" },
    ],
    group: "Data",
    icon: "🔎",
    inputs: "items (CEL), predicate (CEL), mode (keep/drop)",
    label: "Filter",
    name: "filter",
    outputs: "resultVar",
    source: "base",
    summary: "Keep (or drop) collection items matching a predicate.",
  },
  {
    description:
      "A LOOP — like For Each, it iterates a collection per item. A plain map projects each item through the per-item expression into a new collection. An OPTIONAL child body sub-sequence runs per item for richer per-item work. The body loops back (rejoins) each item.",
    fields: [
      {
        key: "items",
        kind: "expression",
        label: "Items (CEL)",
        pillable: true,
      },
      { key: "as", kind: "text", label: "Item var", placeholder: "item" },
      {
        key: "expression",
        kind: "expression",
        label: "Per-item (CEL)",
        pillable: true,
      },
      { key: "resultVar", kind: "text", label: "Result var" },
    ],
    group: "Data",
    icon: "🗺️",
    inputs: "items (CEL), as (item var), expression (CEL, optional if body)",
    label: "Map",
    name: "map",
    outputs: "resultVar; item.<as> per iteration",
    source: "base",
    summary: "Loop: project each collection item through an expression (optional body).",
  },

  // Flow (compositions) ------------------------------------------------------
  {
    description:
      "Runs another workflow definition inline as a child saga and waits for it to finish.",
    fields: [
      { key: "workflow", kind: "text", label: "Workflow key" },
      {
        key: "inputMapping",
        kind: "textarea",
        label: "Input mapping (JSON/CEL)",
        pillable: true,
      },
    ],
    group: "Flow",
    icon: "🧵",
    inputs: "workflow (key), inputMapping",
    label: "Sub-Saga",
    name: "sub_saga",
    outputs: "child saga result",
    source: "base",
    summary: "Run another workflow inline and wait for it to finish.",
  },
  {
    description: "Starts another workflow fire-and-forget (does not wait for it).",
    fields: [
      { key: "workflow", kind: "text", label: "Workflow key" },
      {
        key: "inputMapping",
        kind: "textarea",
        label: "Input mapping (JSON/CEL)",
        pillable: true,
      },
    ],
    group: "Flow",
    icon: "🚀",
    inputs: "workflow (key), inputMapping",
    label: "Spawn Saga",
    name: "spawn_saga",
    outputs: "spawned saga id",
    source: "base",
    summary: "Start another workflow fire-and-forget (no wait).",
  },

  // Ops ----------------------------------------------------------------------
  {
    description: "Emits a metric data point (counter or gauge) to the observability pipeline.",
    fields: [
      { key: "metric", kind: "text", label: "Metric name" },
      {
        key: "value",
        kind: "expression",
        label: "Value (CEL)",
        pillable: true,
      },
    ],
    group: "Ops",
    icon: "📊",
    inputs: "metric (name), value (CEL)",
    label: "Metric Emit",
    name: "metric_emit",
    outputs: "metric emitted",
    source: "base",
    summary: "Emit a metric data point (counter / gauge).",
  },
  {
    description:
      "Writes a structured log line to the run timeline at a chosen severity (trace/debug/info/warn/error).",
    // RUNTIME NOTE: the engine should also attach the active OTel trace/span
    // context (trace_id / span_id) to each emitted log line so run-timeline logs
    // correlate with distributed traces. `trace` is the lowest severity level.
    fields: [
      {
        key: "level",
        kind: "select",
        label: "Level",
        options: ["trace", "debug", "info", "warn", "error"],
      },
      {
        key: "message",
        kind: "text",
        label: "Message (CEL / text)",
        pillable: true,
      },
    ],
    group: "Ops",
    icon: "🪵",
    inputs: "level (trace…error), message",
    label: "Log",
    name: "log",
    outputs: "log line",
    source: "base",
    summary: "Write a structured log line to the run timeline.",
  },
  {
    description: "Does nothing — a placeholder or explicit join point.",
    fields: [],
    group: "Ops",
    icon: "⚪",
    inputs: "—",
    label: "No-op",
    name: "noop",
    outputs: "—",
    source: "base",
    summary: "Do nothing — a placeholder / join point.",
  },
  {
    description: "Fails the run (raises an error) unless a condition holds.",
    fields: [
      {
        key: "condition",
        kind: "expression",
        label: "Condition (CEL)",
        pillable: true,
      },
      { key: "message", kind: "text", label: "Failure message" },
    ],
    group: "Ops",
    icon: "✅",
    inputs: "condition (CEL), message",
    label: "Assert",
    name: "assert",
    outputs: "error on failure",
    source: "base",
    summary: "Fail the run unless a condition holds.",
  },
  {
    description:
      "Raises a typed error, triggering catch / compensation. Terminal on its trail unless inside a try_catch.",
    fields: [
      { key: "code", kind: "text", label: "Error code" },
      { key: "message", kind: "text", label: "Message" },
    ],
    group: "Ops",
    icon: "💥",
    inputs: "code, message",
    label: "Error",
    name: "error",
    outputs: "error raised (terminal)",
    source: "base",
    summary: "Raise a typed error, triggering catch / compensation.",
  },
];

// --- 3RD-PARTY / EXTENSION CATALOG -----------------------------------------
/**
 * Registered extension verbs contributed by vendor plug-ins. Same VerbSpec
 * shape; `source: "third_party"` + a vendor. All map onto the base `action`
 * dispatch at runtime, but appear as first-class verbs in the palette.
 *
 * @since 1.0.0
 */
export const THIRD_PARTY_CATALOG: VerbSpec[] = [
  {
    description:
      "Posts a message to a Slack channel via the Slack extension. Registered by the ACME Slack connector.",
    fields: [
      {
        key: "channel",
        kind: "text",
        label: "Channel",
        placeholder: "#incidents",
      },
      {
        key: "text",
        kind: "textarea",
        label: "Text (CEL / template)",
        pillable: true,
      },
    ],
    group: "Actions",
    icon: "💬",
    inputs: "channel, text",
    label: "Slack · Post message",
    name: "action",
    outputs: "message ts",
    source: "third_party",
    summary: "Post a message to a Slack channel.",
    vendor: "ACME Slack Connector",
  },
  {
    description:
      "Triggers a PagerDuty incident against an escalation policy. Registered by the ACME PagerDuty connector.",
    fields: [
      {
        key: "escalationPolicy",
        kind: "text",
        label: "Escalation policy",
        placeholder: "P-ONCALL",
      },
      {
        key: "summary",
        kind: "text",
        label: "Summary (CEL / template)",
        pillable: true,
      },
      {
        key: "severity",
        kind: "select",
        label: "Severity",
        options: ["critical", "error", "warning", "info"],
      },
    ],
    group: "Actions",
    icon: "📟",
    inputs: "escalationPolicy, summary, severity",
    label: "PagerDuty · Page",
    name: "action",
    outputs: "pagerduty incident id",
    source: "third_party",
    summary: "Trigger a PagerDuty incident / page an escalation policy.",
    vendor: "ACME PagerDuty Connector",
  },
  {
    description:
      "Provisions an IPsec tunnel on a Palo Alto firewall via the PAN-OS API. Registered by the Palo Alto Networks connector.",
    fields: [
      {
        key: "device",
        kind: "text",
        label: "Device / vsys",
        placeholder: "fw-edge-01",
      },
      {
        key: "peerAddress",
        kind: "expression",
        label: "Peer address (CEL)",
        pillable: true,
      },
      { key: "psk", kind: "text", label: "Pre-shared key ref" },
    ],
    group: "Actions",
    icon: "🔐",
    inputs: "device, peerAddress, psk",
    label: "Palo Alto · Create IPsec tunnel",
    name: "http_request",
    outputs: "tunnel id",
    source: "third_party",
    summary: "Provision an IPsec tunnel on a Palo Alto firewall.",
    vendor: "Palo Alto Networks",
  },
  {
    description:
      "Pushes a record update to a ServiceNow instance table via the Table API. Registered by the ACME ServiceNow bridge.",
    fields: [
      { key: "table", kind: "text", label: "Table", placeholder: "incident" },
      {
        key: "fields",
        kind: "textarea",
        label: "Field mapping (JSON/CEL)",
        pillable: true,
      },
    ],
    group: "Actions",
    icon: "🔄",
    inputs: "table, sysId, fields",
    label: "ServiceNow · Sync record",
    name: "action",
    outputs: "servicenow sys_id",
    source: "third_party",
    summary: "Push a record update to a ServiceNow instance.",
    vendor: "ACME ServiceNow Bridge",
  },
];

/**
 * A synthetic palette key (name + vendor) for a 3rd-party verb, since several
 * share the base `action`/`http_request` name.
 *
 * @since 1.0.0
 */
export const thirdPartyKey = (spec: VerbSpec): string => `${spec.vendor ?? "ext"}::${spec.label}`;

/**
 * The base catalog indexed by verb name.
 *
 * @since 1.0.0
 */
export const VERB_BY_NAME: Record<VerbName, VerbSpec> = Object.fromEntries(
  VERB_CATALOG.map((verb) => [verb.name, verb]),
) as Record<VerbName, VerbSpec>;

/**
 * The order the palette lists verb groups.
 *
 * @since 1.0.0
 */
export const VERB_GROUP_ORDER: VerbGroup[] = [
  "Boundary",
  "Control",
  "Actions",
  "Waits",
  // Signals + Events sit adjacent: matched emit/wait pairs, kept as two
  // distinct groups (see #97 W3/W4).
  "Signals",
  "Events",
  "Human",
  "Data",
  "Flow",
  "Ops",
];

/**
 * Verbs whose canvas card renders a "pause / human" styling.
 *
 * @since 1.0.0
 */
export const PAUSE_VERBS = new Set<VerbName>([
  "collect_input",
  "manual_approval",
  "wait_duration",
  "wait_for_event",
  "wait_for_signal",
  "wait_until",
]);

/**
 * Verbs that render labelled branch lanes side by side.
 *
 * @since 1.0.0
 */
export const BRANCH_VERBS = new Set<VerbName>(["decision", "switch"]);

/**
 * Verbs that render fan-out child lanes (loops render their body as one lane;
 * map's body lane is optional).
 *
 * @since 1.0.0
 */
export const FANOUT_VERBS = new Set<VerbName>(["foreach", "map", "parallel", "try_catch", "while"]);

/**
 * Verbs that terminate their trail (nothing may run after them on that trail).
 * `end` = normal completion; `cancel` = abort+compensate; `error` = raise.
 *
 * @since 1.0.0
 */
export const TERMINAL_VERBS = new Set<VerbName>(["cancel", "end", "error"]);

/**
 * Loop constructs whose body loops back to an entry node at the body head
 * (also where the canvas renders the teal loop-entry node). `map` iterates a
 * collection per-item like foreach, so it is a loop too (its per-item child
 * body is OPTIONAL — a plain map has no body).
 *
 * @since 1.0.0
 */
export const LOOP_VERBS = new Set<VerbName>(["foreach", "map", "while"]);

/**
 * Verbs whose lanes can carry an explicit merge target (rejoin to a sub-entry).
 *
 * @since 1.0.0
 */
export const MERGEABLE_OWNERS = new Set<VerbName>([
  "collect_input",
  "decision",
  "join",
  "manual_approval",
  "parallel",
  "switch",
]);

/**
 * Default max iterations for a `while` loop when maxIterations is unset.
 *
 * @since 1.0.0
 */
export const WHILE_DEFAULT_MAX_ITERATIONS = 50;

/**
 * The role of a lane within its owner (used to force try/catch semantics).
 *
 * @since 1.0.0
 */
export type LaneRole = "branch" | "catch" | "try";

// --- LANE SEMANTICS ---------------------------------------------------------
/**
 * The termination semantics of ONE lane, given its owner verb + role.
 *   "end"        : terminal — renders an End cap; NO merge target.
 *   "merge"      : non-terminal — MUST name an explicit merge target (sub-entry).
 *   "loop-back"  : non-terminal — loops back to the construct's entry node
 *                  (foreach/while body, try_catch TRY). No merge target.
 *   "forced-end" : always terminal, non-configurable (try_catch CATCH).
 *
 * @since 1.0.0
 */
export type LaneSemantics = "end" | "forced-end" | "loop-back" | "merge";

/**
 * Determine a lane's role from the owner verb + its position.
 *
 * @since 1.0.0
 */
export const laneRoleFor = (ownerType: VerbName, laneIndex: number): LaneRole => {
  if (ownerType === "try_catch") return laneIndex === 0 ? "try" : "catch";
  return "branch";
};

/**
 * Whether a lane defaults to TERMINAL (end) when `terminal` is undefined.
 *   decision/switch/parallel/join lanes  → default END (true).
 *   foreach/while body                   → default REJOIN/loop-back (false).
 *   try_catch TRY                        → default REJOIN (false).
 *   try_catch CATCH                      → forced END (true).
 *
 * @since 1.0.0
 */
export const laneDefaultsTerminal = (ownerType: VerbName, role: LaneRole): boolean => {
  if (ownerType === "try_catch") return role === "catch";
  if (LOOP_VERBS.has(ownerType)) return false;
  return true;
};

/**
 * The EFFECTIVE terminal flag for a lane (owner-type default when unset; CATCH
 * is always terminal regardless of the stored flag).
 *
 * @since 1.0.0
 */
export const laneIsTerminal = (
  ownerType: VerbName,
  role: LaneRole,
  branch: Pick<Branch, "terminal">,
): boolean => {
  if (ownerType === "try_catch" && role === "catch") return true;
  return branch.terminal ?? laneDefaultsTerminal(ownerType, role);
};

/**
 * The full semantics of a lane (drives canvas terminus + validation).
 *
 * @since 1.0.0
 */
export const laneSemantics = (
  ownerType: VerbName,
  role: LaneRole,
  branch: Pick<Branch, "terminal">,
): LaneSemantics => {
  if (ownerType === "try_catch" && role === "catch") return "forced-end";
  if (laneIsTerminal(ownerType, role, branch)) return "end";
  // Non-terminal: loop constructs and the TRY lane loop back; everything else
  // must merge to an explicit sub-entry.
  if (LOOP_VERBS.has(ownerType) || role === "try") return "loop-back";
  return "merge";
};

/**
 * Verbs that require a matching emit somewhere in the workflow.
 *
 * @since 1.0.0
 */
export const SIGNAL_WAIT_VERBS = new Set<VerbName>(["wait_for_signal"]);

// --- SET_VAR ASSIGNMENTS (one or many) --------------------------------------
/**
 * One set_var assignment row. set_var supports one OR many assignments; rows are
 * stored as a JSON string in config.assignments, with a legacy single
 * {name,value} pair still read for back-compat. Empty rows (no name) are ignored
 * for outputs/validation.
 *
 * @since 1.0.0
 */
export interface Assignment {
  name: string;
  value: string;
}

/**
 * Read the assignment rows for a set_var step, tolerating both the new
 * config.assignments JSON array AND the legacy single {name,value}.
 *
 * @since 1.0.0
 */
export const setVariableAssignments = (step: Step): Assignment[] => {
  const raw = step.config.assignments;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed))
        return parsed
          .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === "object")
          .map((r) => ({
            name: String(r.name ?? ""),
            value: String(r.value ?? ""),
          }));
    } catch {
      // Fall through to the legacy single pair on malformed JSON.
    }
  }
  // Legacy back-compat: a single {name, value} pair.
  if (step.config.name || step.config.value)
    return [{ name: step.config.name ?? "", value: step.config.value ?? "" }];
  return [];
};

/**
 * Serialize assignment rows back into the config.assignments JSON string.
 *
 * @since 1.0.0
 */
export const serializeAssignments = (rows: Assignment[]): string => JSON.stringify(rows);

/**
 * Who a human task is assigned to. `ref` meaning by kind:
 *   user   → a user directory id/handle
 *   group  → a user directory group id (the context-scoped unit; assignment
 *            groups are Groups)
 *   record → a record-relative path (e.g. record.assignment_group.manager)
 *   cel    → a raw CEL expression resolving to the eligible set
 * `filter` is an optional CEL condition narrowing the resolved set.
 *
 * @since 1.0.0
 */
export interface AssignTarget {
  filter?: string;
  kind: AssignTargetKind;
  ref: string;
}

// --- HUMAN-TASK CONFIG (manual_approval + collect_input) --------------------
// Structured config is JSON-encoded into the string config map (the set_var
// precedent). These types + (de)serializers are the single source of truth.
/**
 * How an assignment target is resolved.
 *
 * @since 1.0.0
 */
export type AssignTargetKind = "cel" | "group" | "record" | "user";

/**
 * The decision rule for a human approval gate.
 *
 * @since 1.0.0
 */
export type DecisionRule = "quorum" | "single" | "unanimous";

/**
 * One pre-breach escalation step. Fires at afterPct (% of dueIn) OR afterAbs
 * (absolute offset like "24h"); notifies and/or reassigns to `target`.
 *
 * @since 1.0.0
 */
export interface Escalation {
  action: "notify_reassign" | "notify" | "reassign";
  afterAbs?: string;
  afterPct?: number;
  target?: AssignTarget;
}

const parseJson = <T>(raw: string | undefined): T | undefined => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

/**
 * Read a JSON-encoded AssignTarget from config[key] (e.g. "assignee").
 *
 * @since 1.0.0
 */
export const readAssignTarget = (step: Step, key: string): AssignTarget | undefined =>
  parseJson<AssignTarget>(step.config[key]);

/**
 * Serialize an AssignTarget to its JSON config string.
 *
 * @since 1.0.0
 */
export const writeAssignTarget = (target: AssignTarget): string => JSON.stringify(target);

/**
 * Read the JSON-encoded Escalation from config.escalation.
 *
 * @since 1.0.0
 */
export const readEscalation = (step: Step): Escalation | undefined =>
  parseJson<Escalation>(step.config.escalation);

/**
 * Serialize an Escalation to its JSON config string.
 *
 * @since 1.0.0
 */
export const writeEscalation = (esc: Escalation): string => JSON.stringify(esc);

// --- INLINE FIELDS (collect_input) ------------------------------------------
/**
 * A one-off inline field for a collect_input with no pre-authored form.
 *
 * @since 1.0.0
 */
export interface InlineField {
  label?: string;
  name: string;
  type: string; // "text" | "number" | "date" | "bool" | "select"
}

/**
 * Read the JSON-encoded inline fields for a collect_input step.
 *
 * @since 1.0.0
 */
export const readInlineFields = (step: Step): InlineField[] => {
  const parsed = parseJson<unknown>(step.config.inlineFields);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === "object")
    .map((r) => ({
      label: r.label ? String(r.label) : undefined,
      name: String(r.name ?? ""),
      type: String(r.type ?? "text"),
    }));
};

/**
 * Serialize inline fields to their JSON config string.
 *
 * @since 1.0.0
 */
export const writeInlineFields = (rows: InlineField[]): string => JSON.stringify(rows);

/**
 * The ref strings a human-task step produces as variable outputs. Used by both
 * workflowScope.stepOutputPills and workflowValidation.stepOutputs so the two
 * can never drift apart.
 *
 * @since 1.0.0
 */
export const humanTaskOutputReferences = (step: Step): string[] => {
  if (step.type === "manual_approval") {
    return [
      `vars.${step.id}.decision`,
      `vars.${step.id}.decidedBy`,
      `vars.${step.id}.decidedAt`,
      `vars.${step.id}.comment`,
    ];
  }
  if (step.type === "collect_input") {
    const fields = readInlineFields(step);
    const references: string[] = fields
      .filter((f) => f.name)
      .map((f) => `vars.${step.id}.${f.name}`);
    if (references.length === 0 && step.config.formRef) references.push(`vars.${step.id}`);
    references.push(`vars.${step.id}.submittedBy`, `vars.${step.id}.submittedAt`);
    return references;
  }
  return [];
};

// --- WAIT DURATION COMBO ----------------------------------------------------
/**
 * A structured duration authored as year/month/week/day/hour/min/sec fields and
 * composed into an ISO-8601 duration string. Capped at 365 days total.
 *
 * @since 1.0.0
 */
export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  months: number;
  seconds: number;
  weeks: number;
  years: number;
}

/**
 * An all-zero DurationParts.
 *
 * @since 1.0.0
 */
export const EMPTY_DURATION: DurationParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  months: 0,
  seconds: 0,
  weeks: 0,
  years: 0,
};

/**
 * The ordered fields of the duration combo (key + label + max), used to render
 * the number inputs. `years` maxes at 1 and total is capped at 365 days.
 *
 * @since 1.0.0
 */
export const DURATION_FIELDS: {
  key: keyof DurationParts;
  label: string;
  max: number;
}[] = [
  { key: "years", label: "yr", max: 1 },
  { key: "months", label: "mo", max: 12 },
  { key: "weeks", label: "wk", max: 53 },
  { key: "days", label: "day", max: 365 },
  { key: "hours", label: "hr", max: 23 },
  { key: "minutes", label: "min", max: 59 },
  { key: "seconds", label: "sec", max: 59 },
];

// Approximate seconds-per-unit for the 365-day cap check (calendar-agnostic).
const SECONDS_PER: Record<keyof DurationParts, number> = {
  days: 86_400,
  hours: 3600,
  minutes: 60,
  months: 30 * 86_400,
  seconds: 1,
  weeks: 7 * 86_400,
  years: 365 * 86_400,
};

/**
 * The maximum wait duration, in days.
 *
 * @since 1.0.0
 */
export const MAX_DURATION_DAYS = 365;

/**
 * The maximum wait duration, in seconds.
 *
 * @since 1.0.0
 */
export const MAX_DURATION_SECONDS = MAX_DURATION_DAYS * 86_400;

/**
 * Total (approximate) seconds a DurationParts represents — for the cap check.
 *
 * @since 1.0.0
 */
export const durationTotalSeconds = (parts: DurationParts): number =>
  (Object.keys(SECONDS_PER) as (keyof DurationParts)[]).reduce(
    (sum, key) => sum + (parts[key] || 0) * SECONDS_PER[key],
    0,
  );

/**
 * Whether a DurationParts exceeds the 365-day cap.
 *
 * @since 1.0.0
 */
export const durationExceedsCap = (parts: DurationParts): boolean =>
  durationTotalSeconds(parts) > MAX_DURATION_SECONDS;

/**
 * Compose the parts into an ISO-8601 duration string (e.g. P1Y2M3DT4H5M6S).
 * Returns "" for an all-zero duration.
 *
 * @since 1.0.0
 */
export const composeIsoDuration = (parts: DurationParts): string => {
  const datePart = `${parts.years ? `${parts.years}Y` : ""}${parts.months ? `${parts.months}M` : ""}${parts.weeks ? `${parts.weeks}W` : ""}${parts.days ? `${parts.days}D` : ""}`;
  const timePart = `${parts.hours ? `${parts.hours}H` : ""}${parts.minutes ? `${parts.minutes}M` : ""}${parts.seconds ? `${parts.seconds}S` : ""}`;
  if (!datePart && !timePart) return "";
  return `P${datePart}${timePart ? `T${timePart}` : ""}`;
};

/**
 * Parse a stored duration back into parts. Reads the structured per-unit config
 * keys the panel writes (duration_years, …); falls back to all-zero.
 *
 * @since 1.0.0
 */
export const parseDurationParts = (config: Record<string, string>): DurationParts => ({
  days: Number(config.duration_days) || 0,
  hours: Number(config.duration_hours) || 0,
  minutes: Number(config.duration_minutes) || 0,
  months: Number(config.duration_months) || 0,
  seconds: Number(config.duration_seconds) || 0,
  weeks: Number(config.duration_weeks) || 0,
  years: Number(config.duration_years) || 0,
});

/**
 * Parse an entry verb's declared input-contract names (comma-separated).
 *
 * @since 1.0.0
 */
export const entryDeclaredInputs = (step: Step): string[] =>
  (step.config.inputs ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * A one-line config summary shown on each canvas card.
 *
 * @since 1.0.0
 */
export const stepSummary = (step: Step): string => {
  const c = step.config;
  switch (step.type) {
    case "action": {
      if (c.action) return `${c.action}${c.queue ? ` → ${c.queue}` : " · rmq"}`;
      if (c.channel) return `slack ${c.channel}`;
      if (c.escalationPolicy) return `page ${c.escalationPolicy}`;
      if (c.table) return `snow ${c.table}`;
      return "action";
    }
    case "cancel": {
      return `cancel ${c.target || "self"}${c.reason ? ` · ${c.reason}` : ""}`;
    }
    case "collect_input": {
      if (c.formRef) return `form: ${c.formRef}`;
      const inlineCount = readInlineFields(step).filter((f) => f.name).length;
      return inlineCount > 0
        ? `${inlineCount} inline field${inlineCount === 1 ? "" : "s"}`
        : "no fields";
    }
    case "decision": {
      return c.condition ?? "condition?";
    }
    case "end": {
      return "normal completion";
    }
    case "entry": {
      return `entry ${c.name ?? "…"}${c.inputs ? ` (${c.inputs})` : ""}`;
    }
    case "filter": {
      return `${c.mode === "drop" ? "filter out where" : "keep where"} ${c.predicate ?? "…"}`;
    }
    case "foreach": {
      return `each ${c.as ?? "item"} in ${c.items ?? "…"}`;
    }
    case "http_request": {
      return `${c.method ?? "GET"} ${c.url ?? c.device ?? "…"}`;
    }
    case "log": {
      return `${c.level ?? "info"}: ${c.message ?? ""}`;
    }
    case "manual_approval": {
      const rule = c.rule ?? "single";
      return `${rule}${c.dueIn ? ` · due ${c.dueIn}` : ""}`;
    }
    case "map": {
      let tail = "";
      if ((step.children?.[0]?.steps.length ?? 0) > 0) tail = " · body";
      else if (c.expression) tail = ` → ${c.expression}`;
      return `map ${c.as ?? "item"} in ${c.items ?? "…"}${tail}`;
    }
    case "parallel": {
      return `${step.children?.length ?? 0} trails · join ${c.join ?? "wait-all"}${c.join === "quorum" ? ` (${c.quorum ?? "?"})` : ""}`;
    }
    case "set_var": {
      const rows = setVariableAssignments(step).filter((r) => r.name.trim());
      if (rows.length === 0) return "var → …";
      if (rows.length === 1) return `${rows[0].name} → ${rows[0].value || "…"}`;
      return `${rows.length} assignments · ${rows.map((r) => r.name).join(", ")}`;
    }
    case "switch": {
      return `on ${c.on ?? "…"}`;
    }
    case "wait_duration": {
      return `wait ${c.duration || composeIsoDuration(parseDurationParts(c)) || "…"}`;
    }
    case "wait_for_signal": {
      return `signal: ${c.signal ?? "…"}`;
    }
    case "wait_until": {
      return c.mode === "relative"
        ? `wait +${composeIsoDuration(parseDurationParts(c)) || "…"}`
        : `until ${c.until ?? "…"}`;
    }
    case "while": {
      return `while ${c.condition ?? "…"} · max ${c.maxIterations || WHILE_DEFAULT_MAX_ITERATIONS}`;
    }
    default: {
      return VERB_BY_NAME[step.type]?.summary ?? step.type;
    }
  }
};

/**
 * A one-line summary of a trigger.
 *
 * @since 1.0.0
 */
export const triggerSummary = (trigger: Trigger): string => {
  switch (trigger.kind) {
    case "cron": {
      return `cron ${trigger.schedule ?? ""}`.trim();
    }
    case "event": {
      return `event ${trigger.eventType ?? ""}`.trim();
    }
    case "manual": {
      return "manual trigger";
    }
    case "record": {
      return `${trigger.recordType ?? "record"}${trigger.toState ? `: ${trigger.fromState ?? "*"} → ${trigger.toState}` : ".created"}`;
    }
  }
};
