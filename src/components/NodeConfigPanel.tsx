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
import { useState } from "react";

import {
  type Assignment,
  type AssignTarget,
  type AssignTargetKind,
  type Branch,
  composeIsoDuration,
  type DecisionRule,
  DURATION_FIELDS,
  durationExceedsCap,
  type DurationParts,
  durationTotalSeconds,
  entryDeclaredInputs,
  type Escalation,
  type InlineField,
  laneRoleFor,
  laneSemantics,
  MAX_DURATION_DAYS,
  MERGEABLE_OWNERS,
  parseDurationParts,
  readAssignTarget,
  readEscalation,
  readInlineFields,
  serializeAssignments,
  setVariableAssignments,
  type Stage,
  type Step,
  type Trigger,
  type TriggerKind,
  VERB_BY_NAME,
  type VerbField,
  writeAssignTarget,
  writeEscalation,
  writeInlineFields,
} from "../workflowData";
import { type EntryPoint, type Pill } from "../workflowScope";
import { ConditionBuilder } from "./ConditionBuilder";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "./primitives";
import { FlaskConical, Pill as PillIcon, Plus, Trash2 } from "./primitives/icons";

// RIGHT pane — node config. For the selected node: label + note + per-verb
// config fields. Pillable fields get a pill picker (menu of in-scope pills) that
// inserts a reference token; referenced pills already in the value render as
// chips. Positional scope is computed by the caller and passed in as `pills`.

/**
 * Props for {@link NodeConfigPanel}.
 *
 * @since 1.0.0
 */
export interface ConfigPanelProps {
  // Whether the flow is enabled (fires) — surfaced as a switch on the trigger.
  // Undefined = enabled (back-compat). onEnabledChange persists via autosave.
  enabled?: boolean;
  // Entry points available as merge targets (for lane rejoin config).
  entryPoints: EntryPoint[];
  // Toggle a map step's OPTIONAL per-item child body on/off.
  onAddMapBody: (stepId: string) => void;
  onConfigChange: (key: string, value: string) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onLabelChange: (label: string) => void;
  // Patch a lane (branch/child) of the selected step — termination + merge.
  onLaneChange: (laneId: string, patch: Partial<Branch>) => void;
  onNoteChange: (note: string) => void;
  onRemoveMapBody: (stepId: string) => void;
  onStageRename?: (name: string) => void;
  onTriggerChange: (patch: Partial<Trigger>) => void;
  pills: Pill[];
  // A selected STAGE (clicking a stage band, no step) -> renders a rename panel;
  // live via onStageRename.
  selectedStage?: Stage;
  step: Step | undefined;
  trigger: Trigger;
}

// Chips: highlight the pill refs already present in a value.
const REF_RE = /\b(?:record|vars|trigger|item)\.[A-Za-z0-9_]+/g;
const chipsIn = (value: string): string[] => {
  const m = value.match(REF_RE);
  return m ? [...new Set(m)] : [];
};

const pillKindLabel = (kind: string): string => {
  if (kind === "field") return "Record fields";
  if (kind === "output") return "Node outputs";
  return "Trigger";
};

const pillReferenceToneClass = (reference: string): string => {
  if (reference.startsWith("record.")) return "border-teal-300 bg-teal-50 text-teal-700";
  if (reference.startsWith("vars.")) return "border-indigo-300 bg-indigo-50 text-indigo-700";
  return "border-slate-300 bg-slate-50 text-slate-600";
};

const durationSummary = (over: boolean, iso: string, total: number): string => {
  if (over) return `Over the ${MAX_DURATION_DAYS}-day cap — reduce the total.`;
  if (iso) return `${iso} · ~${Math.round(total / 86_400)}d`;
  return "— no duration set —";
};

const stageKindLabel = (kind: string): string => {
  if (kind === "pre-stage") return "Pre-Stage";
  if (kind === "end-stage") return "End Stage";
  return "Stage";
};

const PillPicker = ({
  onInsert,
  pills,
}: {
  onInsert: (reference: string) => void;
  pills: Pill[];
}) => {
  const byKind = {
    field: pills.filter((p) => p.kind === "field"),
    output: pills.filter((p) => p.kind === "output"),
    trigger: pills.filter((p) => p.kind === "trigger"),
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-6 gap-1 px-1.5 text-[10px]" size="sm" variant="outline">
          <PillIcon className="size-3" /> pill
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 w-64 overflow-auto">
        {pills.length === 0 ? (
          <DropdownMenuItem disabled>No pills in scope here</DropdownMenuItem>
        ) : null}
        {(["field", "output", "trigger"] as const).map((kind) =>
          byKind[kind].length > 0 ? (
            <div key={kind}>
              <DropdownMenuLabel className="text-[10px] uppercase text-slate-600">
                {pillKindLabel(kind)}
              </DropdownMenuLabel>
              {byKind[kind].map((pill) => (
                <DropdownMenuItem
                  className="gap-2"
                  key={pill.ref}
                  onSelect={() => onInsert(pill.ref)}
                >
                  <Plus className="size-3 text-slate-600" />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs">{pill.ref}</span>
                    <span className="block truncate text-[10px] text-slate-600">
                      {pill.label} · {pill.origin}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ) : null,
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Field = ({
  field,
  onChange,
  pills,
  value,
}: {
  field: VerbField;
  onChange: (value: string) => void;
  pills: Pill[];
  value: string;
}) => {
  const insert = (reference: string) => {
    const glue = value && !/\s$/.test(value) ? " " : "";
    onChange(`${value}${glue}${reference}`);
  };
  const chips = field.pillable ? chipsIn(value) : [];
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-slate-600">{field.label}</Label>
        {field.pillable ? <PillPicker onInsert={insert} pills={pills} /> : null}
      </div>
      {field.kind === "select" && (
        <Select onValueChange={onChange} value={value || undefined}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.kind === "textarea" && (
        <Textarea
          className="min-h-20 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          value={value}
        />
      )}
      {field.kind === "expression" && (
        <div className="grid gap-1.5">
          <Textarea
            className="min-h-16 font-mono text-xs"
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              field.placeholder ?? "CEL expression — e.g. record.impact * record.urgency"
            }
            value={value}
          />
          {field.examples?.length ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-mono text-[10px] font-semibold text-teal-600">fx</span>
              {field.examples.map((example) => (
                <button
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  key={example}
                  onClick={() => insert(example)}
                  title="Insert example"
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
      {!["expression", "select", "textarea"].includes(field.kind) && (
        <Input
          className="h-8 text-sm"
          inputMode={field.kind === "number" ? "numeric" : undefined}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          value={value}
        />
      )}
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {chips.map((reference) => (
            <span
              className={cn(
                "rounded-full border px-1.5 py-0.5 font-mono text-[10px]",
                pillReferenceToneClass(reference),
              )}
              key={reference}
            >
              {reference}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TRIGGER_KINDS: TriggerKind[] = ["record", "cron", "manual", "event"];

// Compact switch — a track+knob button. `checked` is the on state; onChange
// flips it.
const EnabledSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) => (
  <button
    aria-checked={checked}
    aria-label={checked ? "Enabled — flow fires" : "Disabled — flow never fires"}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
      checked ? "bg-emerald-500" : "bg-slate-300",
    )}
    onClick={() => onChange(!checked)}
    role="switch"
    type="button"
  >
    <span
      className={cn(
        "inline-block size-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0.5",
      )}
    />
  </button>
);

const TriggerConfig = ({
  enabled,
  onEnabledChange,
  onTriggerChange,
  trigger,
}: {
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onTriggerChange: (patch: Partial<Trigger>) => void;
  trigger: Trigger;
}) => (
  <div className="grid gap-3">
    {onEnabledChange ? (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border px-3 py-2",
          enabled === false
            ? "border-slate-200 bg-slate-50"
            : "border-emerald-200 bg-emerald-50/60",
        )}
      >
        <div>
          <div className="text-xs font-medium text-slate-700">
            {enabled === false ? "Disabled" : "Enabled"}
          </div>
          <div className="text-[10px] text-slate-500">
            {enabled === false
              ? "Definition is kept but the trigger never fires."
              : "The trigger fires and starts runs."}
          </div>
        </div>
        <EnabledSwitch checked={enabled !== false} onChange={onEnabledChange} />
      </div>
    ) : null}
    <div className="grid gap-1.5">
      <Label className="text-xs text-slate-600">Kind</Label>
      <Select
        onValueChange={(value) => onTriggerChange({ kind: value as TriggerKind })}
        value={trigger.kind}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TRIGGER_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {kind}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="grid gap-1.5">
      <Label className="text-xs text-slate-600">Label</Label>
      <Input
        className="h-8 text-sm"
        onChange={(event) => onTriggerChange({ label: event.target.value })}
        value={trigger.label}
      />
    </div>
    {trigger.kind === "record" ? (
      <>
        <div className="grid gap-1.5">
          <Label className="text-xs text-slate-600">Record type</Label>
          <Select
            onValueChange={(value) => onTriggerChange({ recordType: value })}
            value={trigger.recordType ?? undefined}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select record type" />
            </SelectTrigger>
            <SelectContent>
              {["incident", "change", "request"].map((rt) => (
                <SelectItem key={rt} value={rt}>
                  {rt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-600">
            Declares which record.* fields are in scope as pills downstream.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-600">From state</Label>
            <Input
              className="h-8 text-sm"
              onChange={(event) => onTriggerChange({ fromState: event.target.value })}
              placeholder="*"
              value={trigger.fromState ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-600">To state</Label>
            <Input
              className="h-8 text-sm"
              onChange={(event) => onTriggerChange({ toState: event.target.value })}
              placeholder="created"
              value={trigger.toState ?? ""}
            />
          </div>
        </div>
      </>
    ) : null}
    {trigger.kind === "cron" ? (
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Schedule (cron, UTC)</Label>
        <Input
          className="h-8 font-mono text-xs"
          onChange={(event) => onTriggerChange({ schedule: event.target.value })}
          placeholder="0 2 * * *"
          value={trigger.schedule ?? ""}
        />
      </div>
    ) : null}
    {trigger.kind === "event" ? (
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Event type</Label>
        <Input
          className="h-8 text-sm"
          onChange={(event) => onTriggerChange({ eventType: event.target.value })}
          placeholder="record.updated"
          value={trigger.eventType ?? ""}
        />
      </div>
    ) : null}
  </div>
);

// Per-lane termination + merge editor. Every lane defaults to END; making a
// lane rejoin requires naming an explicit entry point (sub-entry) and supplying
// its declared data contract. Only shown for decision/switch/parallel/join.
const LaneMergeEditor = ({
  entryPoints,
  onLaneChange,
  step,
}: {
  entryPoints: EntryPoint[];
  onLaneChange: (laneId: string, patch: Partial<Branch>) => void;
  step: Step;
}) => {
  const lanes = step.branches ?? step.children ?? [];
  return (
    <div className="grid gap-2 border-t border-slate-100 pt-3">
      <Label className="text-xs font-semibold text-slate-600">Lane termination</Label>
      <p className="text-[10px] text-slate-600">
        Each lane defaults to <span className="font-semibold">End</span>. To rejoin the flow, switch
        a lane to Merge and point it at an entry point, supplying its declared inputs.
      </p>
      {lanes.map((lane, laneIndex) => {
        const role = laneRoleFor(step.type, laneIndex);
        const semantics = laneSemantics(step.type, role, lane);
        const merging = semantics === "merge";
        const entry = lane.merge
          ? entryPoints.find((e) => e.stepId === lane.merge?.entryId)
          : undefined;
        const declared = entry ? entry.inputs : [];
        return (
          <div
            className="grid gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2"
            key={lane.id}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-slate-700">{lane.caseLabel}</span>
              <div className="flex gap-1">
                <button
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    merging ? "bg-slate-100 text-slate-600" : "bg-slate-700 text-white",
                  )}
                  onClick={() => onLaneChange(lane.id, { merge: undefined, terminal: true })}
                  type="button"
                >
                  End
                </button>
                <button
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    merging ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600",
                  )}
                  onClick={() =>
                    onLaneChange(lane.id, {
                      merge: lane.merge ?? { entryId: "", inputs: {} },
                      terminal: false,
                    })
                  }
                  type="button"
                >
                  Merge
                </button>
              </div>
            </div>
            {merging ? (
              <>
                <Select
                  onValueChange={(entryId) =>
                    onLaneChange(lane.id, {
                      merge: { entryId, inputs: lane.merge?.inputs ?? {} },
                      terminal: false,
                    })
                  }
                  value={lane.merge?.entryId || undefined}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Pick an entry point…" />
                  </SelectTrigger>
                  <SelectContent>
                    {entryPoints.length === 0 ? (
                      <SelectItem disabled value="_none">
                        No entry points — add an Entry verb first
                      </SelectItem>
                    ) : (
                      entryPoints.map((e) => (
                        <SelectItem key={e.stepId} value={e.stepId}>
                          {e.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {declared.length > 0 && (
                  <div className="grid gap-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-600">
                      Data contract
                    </span>
                    {declared.map((name) => (
                      <div className="grid grid-cols-[70px_1fr] items-center gap-1.5" key={name}>
                        <span className="truncate font-mono text-[10px] text-slate-600">
                          {name}
                        </span>
                        <Input
                          className="h-7 font-mono text-[11px]"
                          onChange={(event) =>
                            onLaneChange(lane.id, {
                              merge: {
                                entryId: lane.merge?.entryId ?? "",
                                inputs: {
                                  ...lane.merge?.inputs,
                                  [name]: event.target.value,
                                },
                              },
                              terminal: false,
                            })
                          }
                          placeholder="value / CEL"
                          value={lane.merge?.inputs?.[name] ?? ""}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {declared.length === 0 && entry && (
                  <span className="text-[10px] italic text-slate-600">
                    Entry declares no inputs.
                  </span>
                )}
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// The entry verb's own contract editor helper — echoed under its config so the
// author sees which inputs downstream merges must supply.
const EntryContractHint = ({ step }: { step: Step }) => {
  const declared = entryDeclaredInputs(step);
  if (declared.length === 0) return null;
  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50/60 px-2.5 py-2">
      <span className="text-[10px] font-semibold uppercase text-teal-600">Declared contract</span>
      <div className="mt-1 flex flex-wrap gap-1">
        {declared.map((name) => (
          <span
            className="rounded-full border border-teal-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-teal-700"
            key={name}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- ASSIGN TARGET FIELD — reusable picker for human-task targets -------------
// Renders a kind Select + ref Input (placeholder varies) + optional CEL filter.
const ASSIGN_KIND_LABELS: Record<AssignTargetKind, string> = {
  cel: "CEL expression",
  group: "Group",
  record: "Record-relative",
  user: "User",
};

const ASSIGN_KIND_PLACEHOLDER: Record<AssignTargetKind, string> = {
  cel: "CEL expression (e.g. vars.approver)",
  group: "group id",
  record: "record.assignment_group.manager",
  user: "user handle or id",
};

const AssignTargetField = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (next: AssignTarget) => void;
  value: AssignTarget | undefined;
}) => {
  const kind: AssignTargetKind = value?.kind ?? "group";
  const reference = value?.ref ?? "";
  const filter = value?.filter ?? "";

  const set = (patch: Partial<AssignTarget>) =>
    onChange({ filter: filter || undefined, kind, ref: reference, ...patch });

  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-slate-600">{label}</Label>
      <Select
        onValueChange={(k) => set({ filter: undefined, kind: k as AssignTargetKind, ref: "" })}
        value={kind}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ASSIGN_KIND_LABELS) as AssignTargetKind[]).map((k) => (
            <SelectItem key={k} value={k}>
              {ASSIGN_KIND_LABELS[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="h-8 text-sm"
        onChange={(e) => set({ ref: e.target.value })}
        placeholder={ASSIGN_KIND_PLACEHOLDER[kind]}
        value={reference}
      />
      {["cel", "group", "record"].includes(kind) ? (
        <div className="grid gap-0.5">
          <Label className="text-[10px] text-slate-500">Filter (CEL, optional)</Label>
          <Input
            className="h-7 font-mono text-xs"
            onChange={(e) => set({ filter: e.target.value || undefined })}
            placeholder="e.g. user.department == 'IT'"
            value={filter}
          />
        </div>
      ) : null}
    </div>
  );
};

// --- ESCALATION FIELD — shared by manual_approval and collect_input -----------
const EscalationField = ({
  onConfigChange,
  step,
}: {
  onConfigChange: (key: string, value: string) => void;
  step: Step;
}) => {
  const esc = readEscalation(step);
  const escEnabled = Boolean(esc);
  const escAction = esc?.action ?? "notify";
  const escAfterAbs = esc?.afterAbs ?? "";
  const escTarget = esc?.target;

  const setEsc = (patch: null | Partial<Escalation>) => {
    if (patch === null) {
      onConfigChange("escalation", "");
      return;
    }
    const base: Escalation = esc ?? { action: "notify" };
    onConfigChange("escalation", writeEscalation({ ...base, ...patch }));
  };

  const setEscTarget = (target: AssignTarget) => {
    const base: Escalation = esc ?? { action: escAction };
    onConfigChange("escalation", writeEscalation({ ...base, target }));
  };

  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-600">Escalation</Label>
        <EnabledSwitch
          checked={escEnabled}
          onChange={(next) => {
            if (next) {
              onConfigChange("escalation", writeEscalation({ action: "notify" }));
            } else {
              setEsc(null);
            }
          }}
        />
      </div>
      {escEnabled ? (
        <div className="grid gap-2">
          <div className="grid gap-1.5">
            <Label className="text-[10px] text-slate-500">Trigger after</Label>
            <Input
              className="h-7 text-xs"
              onChange={(e) => setEsc({ afterAbs: e.target.value || undefined })}
              placeholder="24h before due"
              value={escAfterAbs}
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[10px] text-slate-500">Action</Label>
            <Select
              onValueChange={(v) => setEsc({ action: v as Escalation["action"] })}
              value={escAction}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notify">Notify</SelectItem>
                <SelectItem value="reassign">Reassign</SelectItem>
                <SelectItem value="notify_reassign">Notify + Reassign</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {escAction === "notify" ? null : (
            <AssignTargetField label="Reassign to" onChange={setEscTarget} value={escTarget} />
          )}
        </div>
      ) : (
        <p className="text-[10px] text-slate-500">
          Enable to notify or reassign before the due date elapses.
        </p>
      )}
    </div>
  );
};

// --- APPROVAL CONFIG — manual_approval custom panel --------------------------
const ApprovalConfig = ({
  onConfigChange,
  step,
}: {
  onConfigChange: (key: string, value: string) => void;
  step: Step;
}) => {
  const approvers = readAssignTarget(step, "approvers");
  const rule: DecisionRule = (step.config.rule as DecisionRule) || "single";
  const quorumN = step.config.quorumN ?? "";
  const rejectN = step.config.rejectN ?? "";
  const requireReason = step.config.requireReason === "true";
  const dueIn = step.config.dueIn ?? "";

  return (
    <div className="grid gap-3">
      {/* Approver target */}
      <AssignTargetField
        label="Approver"
        onChange={(next) => onConfigChange("approvers", writeAssignTarget(next))}
        value={approvers}
      />

      {/* Decision rule */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Decision rule</Label>
        <Select onValueChange={(v) => onConfigChange("rule", v)} value={rule}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single — first decision wins</SelectItem>
            <SelectItem value="quorum">Quorum — N approvals required</SelectItem>
            <SelectItem value="unanimous">Unanimous — all must approve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rule === "quorum" ? (
        <div className="grid gap-1.5">
          <Label className="text-xs text-slate-600">Quorum N</Label>
          <Input
            className="h-8 text-sm"
            inputMode="numeric"
            onChange={(e) => onConfigChange("quorumN", e.target.value)}
            placeholder="2"
            value={quorumN}
          />
        </div>
      ) : null}

      {rule === "quorum" ? (
        <div className="grid gap-1.5">
          <Label className="text-xs text-slate-600">Reject after N</Label>
          <Input
            className="h-8 text-sm"
            inputMode="numeric"
            onChange={(e) => onConfigChange("rejectN", e.target.value)}
            placeholder="1"
            value={rejectN}
          />
        </div>
      ) : null}

      {/* Require reason toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
        <div>
          <div className="text-xs font-medium text-slate-700">Require a reason</div>
          <div className="text-[10px] text-slate-500">
            Approver must supply a comment when deciding.
          </div>
        </div>
        <EnabledSwitch
          checked={requireReason}
          onChange={(next) => onConfigChange("requireReason", next ? "true" : "")}
        />
      </div>

      {/* Due in */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Due in</Label>
        <Input
          className="h-8 text-sm"
          onChange={(e) => onConfigChange("dueIn", e.target.value)}
          placeholder="48h"
          value={dueIn}
        />
      </div>

      {/* Escalation — shared EscalationField component */}
      <EscalationField onConfigChange={onConfigChange} step={step} />
    </div>
  );
};

// --- COLLECT INPUT CONFIG — collect_input custom panel -----------------------
const INLINE_FIELD_TYPES = ["text", "number", "date", "bool", "select"] as const;

const CollectInputConfig = ({
  onConfigChange,
  step,
}: {
  onConfigChange: (key: string, value: string) => void;
  step: Step;
}) => {
  // Mode: "form" = reference an external form; "inline" = define fields inline.
  // Derived from config each render so it re-syncs when the panel opens for a
  // different node.
  const localMode: "form" | "inline" = step.config.inlineFields ? "inline" : "form";

  const formReference = step.config.formRef ?? "";
  const assignee = readAssignTarget(step, "assignee");
  const dueIn = step.config.dueIn ?? "";

  // Inline fields editor — mirrors set_var row pattern.
  const rawRows = readInlineFields(step);
  const editableRows: InlineField[] = rawRows.length > 0 ? rawRows : [{ name: "", type: "text" }];

  const commitRows = (next: InlineField[]) => {
    onConfigChange("inlineFields", writeInlineFields(next));
  };

  const setFieldRow = (index: number, patch: Partial<InlineField>) =>
    commitRows(editableRows.map((r, index_) => (index_ === index ? { ...r, ...patch } : r)));
  const addFieldRow = () => commitRows([...editableRows, { name: "", type: "text" }]);
  const removeFieldRow = (index: number) =>
    commitRows(
      editableRows.length <= 1
        ? [{ name: "", type: "text" }]
        : editableRows.filter((_, index_) => index_ !== index),
    );

  const switchMode = (next: "form" | "inline") => {
    if (next === "form") {
      // Clear inline fields when switching to form mode.
      onConfigChange("inlineFields", "");
    } else {
      // Clear formRef when switching to inline mode.
      onConfigChange("formRef", "");
    }
  };

  return (
    <div className="grid gap-3">
      {/* Mode toggle */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Field source</Label>
        <div className="flex gap-1">
          <button
            className={cn(
              "flex-1 rounded px-2 py-1 text-xs font-semibold",
              localMode === "form"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
            onClick={() => switchMode("form")}
            type="button"
          >
            Reference a form
          </button>
          <button
            className={cn(
              "flex-1 rounded px-2 py-1 text-xs font-semibold",
              localMode === "inline"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
            onClick={() => switchMode("inline")}
            type="button"
          >
            Inline fields
          </button>
        </div>
      </div>

      {/* Form mode */}
      {localMode === "form" ? (
        <div className="grid gap-1.5">
          <Label className="text-xs text-slate-600">Form reference</Label>
          <Input
            className="h-8 text-sm"
            onChange={(e) => onConfigChange("formRef", e.target.value)}
            placeholder="pir_review@2"
            value={formReference}
          />
          <p className="text-[10px] text-slate-500">
            A real build resolves this slug against a forms service. Use{" "}
            <span className="font-mono">name@version</span> or just{" "}
            <span className="font-mono">name</span> for latest.
          </p>
        </div>
      ) : null}

      {/* Inline fields mode */}
      {localMode === "inline" ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-600">Fields</Label>
            <Button
              className="h-6 gap-1 px-1.5 text-[10px]"
              onClick={addFieldRow}
              size="sm"
              variant="outline"
            >
              <Plus className="size-3" /> add
            </Button>
          </div>
          {editableRows.map((row, index) => (
            <div className="grid gap-1 rounded-lg border border-slate-200 px-2.5 py-2" key={index}>
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="h-7 text-xs"
                  onChange={(e) => setFieldRow(index, { name: e.target.value })}
                  placeholder="field name (e.g. priority)"
                  value={row.name}
                />
                <button
                  aria-label="Remove field"
                  className="grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => removeFieldRow(index)}
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <Select
                onValueChange={(v) => setFieldRow(index, { type: v })}
                value={row.type || "text"}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INLINE_FIELD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <p className="text-[10px] text-slate-500">
            Each row becomes a form field rendered to the assignee at runtime.
          </p>
        </div>
      ) : null}

      {/* Assignee */}
      <AssignTargetField
        label="Assignee"
        onChange={(next) => onConfigChange("assignee", writeAssignTarget(next))}
        value={assignee}
      />

      {/* Due in */}
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Due in</Label>
        <Input
          className="h-8 text-sm"
          onChange={(e) => onConfigChange("dueIn", e.target.value)}
          placeholder="48h"
          value={dueIn}
        />
      </div>

      {/* Escalation — shared EscalationField component */}
      <EscalationField onConfigChange={onConfigChange} step={step} />
    </div>
  );
};

// --- SET_VAR — repeatable one-or-many assignment editor ----------------------
const SetVarEditor = ({
  onConfigChange,
  pills,
  step,
}: {
  onConfigChange: (key: string, value: string) => void;
  pills: Pill[];
  step: Step;
}) => {
  const rows = setVariableAssignments(step);
  const editable: Assignment[] = rows.length > 0 ? rows : [{ name: "", value: "" }];

  // Any write migrates to config.assignments and clears the legacy single pair
  // so the two representations never disagree.
  const commit = (next: Assignment[]) => {
    onConfigChange("assignments", serializeAssignments(next));
    if (step.config.name) onConfigChange("name", "");
    if (step.config.value) onConfigChange("value", "");
  };

  const setRow = (index: number, patch: Partial<Assignment>) =>
    commit(editable.map((r, index_) => (index_ === index ? { ...r, ...patch } : r)));
  const addRow = () => commit([...editable, { name: "", value: "" }]);
  const removeRow = (index: number) =>
    commit(
      editable.length <= 1
        ? [{ name: "", value: "" }]
        : editable.filter((_, index_) => index_ !== index),
    );

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-slate-600">Assignments</Label>
        <Button
          className="h-6 gap-1 px-1.5 text-[10px]"
          onClick={addRow}
          size="sm"
          variant="outline"
        >
          <Plus className="size-3" /> add
        </Button>
      </div>
      {editable.map((row, index) => {
        const insertValue = (reference: string) => {
          const glue = row.value && !/\s$/.test(row.value) ? " " : "";
          setRow(index, { value: `${row.value}${glue}${reference}` });
        };
        return (
          <div className="grid gap-1 rounded-lg border border-slate-200 px-2.5 py-2" key={index}>
            <div className="flex items-center justify-between gap-2">
              <Input
                className="h-7 text-xs"
                onChange={(event) => setRow(index, { name: event.target.value })}
                placeholder="variable (e.g. state)"
                value={row.name}
              />
              <button
                aria-label="Remove assignment"
                className="grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => removeRow(index)}
                type="button"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">value (CEL / literal)</span>
              <PillPicker onInsert={insertValue} pills={pills} />
            </div>
            <Input
              className="h-7 font-mono text-xs"
              onChange={(event) => setRow(index, { value: event.target.value })}
              placeholder="'Resolved' / vars.count + 1"
              value={row.value}
            />
          </div>
        );
      })}
      <p className="text-[10px] text-slate-500">
        Each named row becomes a downstream <span className="font-mono">vars.&lt;name&gt;</span>{" "}
        pill.
      </p>
    </div>
  );
};

// --- WAIT DURATION — structured combo, 365-day capped -------------------------
const DurationCombo = ({
  onChange,
  parts,
}: {
  onChange: (next: DurationParts) => void;
  parts: DurationParts;
}) => {
  const total = durationTotalSeconds(parts);
  const over = durationExceedsCap(parts);
  const iso = composeIsoDuration(parts);
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-slate-600">Duration (at most {MAX_DURATION_DAYS} days)</Label>
      <div className="grid grid-cols-4 gap-1.5">
        {DURATION_FIELDS.map((field) => (
          <div className="grid gap-0.5" key={field.key}>
            <Input
              className={cn("h-7 text-xs tabular-nums", over && "border-rose-300")}
              inputMode="numeric"
              max={field.max}
              min={0}
              onChange={(event) => {
                const raw = Math.max(0, Math.floor(Number(event.target.value) || 0));
                // Clamp each field to its range (year 0-1 etc.).
                onChange({ ...parts, [field.key]: Math.min(raw, field.max) });
              }}
              type="number"
              value={String(parts[field.key] || 0)}
            />
            <span className="text-center text-[9px] uppercase text-slate-500">{field.label}</span>
          </div>
        ))}
      </div>
      <div
        className={cn(
          "rounded px-2 py-1 font-mono text-[10px]",
          over ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600",
        )}
      >
        {durationSummary(over, iso, total)}
      </div>
    </div>
  );
};

// A "Test" button that opens a dialog showing a canned/echoed result. Used by
// http_request (Test query) + webhook (Test connection). NO network — full-mock.
const TestResultButton = ({
  buttonLabel,
  result,
  title,
}: {
  buttonLabel: string;
  result: () => { body: string; summary: string };
  title: string;
}) => {
  const [open, setOpen] = useState(false);
  const [out, setOut] = useState<{ body: string; summary: string } | undefined>();
  return (
    <>
      <Button
        className="h-7 w-full gap-1.5 text-xs"
        onClick={() => {
          setOut(result());
          setOpen(true);
        }}
        size="sm"
        variant="outline"
      >
        <FlaskConical className="size-3.5" /> {buttonLabel}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-teal-600" /> {title}
            </DialogTitle>
            <DialogDescription>
              Mock result — the designer echoes a canned response. No request is sent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <div className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
              {out?.summary}
            </div>
            <pre className="max-h-60 overflow-auto rounded-md bg-slate-900 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-100">
              {out?.body}
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Persist a DurationParts back to the per-unit config keys AND the composed ISO
// `duration` string (the stored, executable value).
const writeDuration = (
  parts: DurationParts,
  onConfigChange: (key: string, value: string) => void,
): void => {
  onConfigChange("duration_years", String(parts.years || 0));
  onConfigChange("duration_months", String(parts.months || 0));
  onConfigChange("duration_weeks", String(parts.weeks || 0));
  onConfigChange("duration_days", String(parts.days || 0));
  onConfigChange("duration_hours", String(parts.hours || 0));
  onConfigChange("duration_minutes", String(parts.minutes || 0));
  onConfigChange("duration_seconds", String(parts.seconds || 0));
  onConfigChange("duration", composeIsoDuration(parts));
};

// wait_until editor: mode selector (absolute pill/CEL vs relative offset combo).
const WaitUntilEditor = ({
  onConfigChange,
  pills,
  step,
}: {
  onConfigChange: (key: string, value: string) => void;
  pills: Pill[];
  step: Step;
}) => {
  const mode = step.config.mode === "relative" ? "relative" : "absolute";
  const untilField: VerbField = {
    key: "until",
    kind: "expression",
    label: "Until (CEL / ISO)",
    pillable: true,
    placeholder: "record.planned_start",
  };
  return (
    <div className="grid gap-2">
      <div className="grid gap-1.5">
        <Label className="text-xs text-slate-600">Mode</Label>
        <Select onValueChange={(value) => onConfigChange("mode", value)} value={mode}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="absolute">Absolute datetime (pill / CEL)</SelectItem>
            <SelectItem value="relative">Relative offset (computed at run)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === "absolute" ? (
        <Field
          field={untilField}
          onChange={(value) => onConfigChange("until", value)}
          pills={pills}
          value={step.config.until ?? ""}
        />
      ) : (
        <DurationCombo
          onChange={(next) => writeDuration(next, onConfigChange)}
          parts={parseDurationParts(step.config)}
        />
      )}
    </div>
  );
};

// Canned/echoed result for the http_request "Test query". NO network.
const mockHttpResult = (step: Step): { body: string; summary: string } => {
  const method = step.config.method || "GET";
  const url = step.config.url || "https://api.example.com/…";
  const body = {
    ok: true,
    request: { body: step.config.body || null, method, url },
    response: {
      echoed: true,
      id: "mock-1234",
      receivedAt: "2026-01-01T00:00:00Z",
    },
    status: 200,
  };
  return {
    body: JSON.stringify(body, null, 2),
    summary: `${method} ${url} -> 200 OK (mock)`,
  };
};

// Canned/echoed result for the webhook "Test connection". NO network.
const mockWebhookResult = (step: Step): { body: string; summary: string } => {
  const target = step.config.webhook || "https://hooks.example.com/…";
  const body = {
    delivery: {
      accepted: true,
      id: "whk-5678",
      payload: step.config.payload || null,
      target,
    },
    ok: true,
    status: 202,
  };
  return {
    body: JSON.stringify(body, null, 2),
    summary: `POST ${target} -> 202 Accepted (mock)`,
  };
};

// The set of field keys a verb renders through a CUSTOM control (so the default
// field loop skips them). Keyed by verb type.
const CUSTOM_FIELDS: Partial<Record<Step["type"], Set<string>>> = {
  // collect_input: only dueIn is a spec field; the rest are rendered by the custom panel.
  collect_input: new Set(["dueIn"]),
  // Boolean predicates author via the ConditionBuilder. switch.`on` is a bare
  // discriminant expression (not a boolean predicate), so it stays a plain
  // pill-pickable expression field.
  decision: new Set(["condition"]),
  filter: new Set(["predicate"]),
  // manual_approval: only dueIn is a spec field; the rest are rendered by the custom panel.
  manual_approval: new Set(["dueIn"]),
  set_var: new Set(["name", "value"]),
  wait_duration: new Set(["duration"]),
  wait_until: new Set(["until"]),
  while: new Set(["condition"]),
};

/**
 * The right-hand configuration panel for the selected node, stage, or trigger.
 * Renders per-verb config controls and pill pickers, driven entirely by props.
 *
 * @since 1.0.0
 */
export const NodeConfigPanel = ({
  enabled,
  entryPoints,
  onAddMapBody,
  onConfigChange,
  onEnabledChange,
  onLabelChange,
  onLaneChange,
  onNoteChange,
  onRemoveMapBody,
  onStageRename,
  onTriggerChange,
  pills,
  selectedStage,
  step,
  trigger,
}: ConfigPanelProps) => {
  // A selected STAGE (clicked its band) -> rename panel, live updates.
  if (!step && selectedStage) {
    const stageLabel = stageKindLabel(selectedStage.kind);
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">{stageLabel}</div>
          <div className="mt-0.5 text-[11px] text-slate-600">Rename this stage — updates live.</div>
        </div>
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-600">Stage name</Label>
            <Input
              className="h-8 text-sm"
              onChange={(event) => onStageRename?.(event.target.value)}
              placeholder="e.g. Triage"
              value={selectedStage.name}
            />
          </div>
        </div>
      </aside>
    );
  }
  if (!step) {
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">Trigger</div>
          <div className="mt-0.5 text-[11px] text-slate-600">
            Nothing selected — showing the trigger. Click a node to edit it.
          </div>
        </div>
        <div className="flex-1 overflow-auto px-4 py-4">
          <TriggerConfig
            enabled={enabled}
            onEnabledChange={onEnabledChange}
            onTriggerChange={onTriggerChange}
            trigger={trigger}
          />
        </div>
      </aside>
    );
  }

  const spec = VERB_BY_NAME[step.type];
  const customKeys = CUSTOM_FIELDS[step.type];
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-sm">
            {spec?.icon ?? "•"}
          </span>
          <div className="text-sm font-semibold text-slate-800">{spec?.label ?? step.type}</div>
        </div>
        <div className="mt-1 text-[11px] text-slate-600">{spec?.summary}</div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-slate-600">Step label</Label>
            <Input
              className="h-8 text-sm"
              onChange={(event) => onLabelChange(event.target.value)}
              value={step.label}
            />
          </div>
          {(spec?.fields ?? []).map((field) => {
            // Custom-rendered fields are skipped here and drawn by their bespoke
            // control below/at their place in the sequence.
            if (customKeys?.has(field.key)) {
              // Render the condition-family builders IN PLACE of the field.
              if (
                (step.type === "decision" && field.key === "condition") ||
                (step.type === "while" && field.key === "condition") ||
                (step.type === "filter" && field.key === "predicate")
              ) {
                return (
                  <ConditionBuilder
                    examples={field.examples}
                    key={field.key}
                    label={field.label}
                    onChange={(cel) => onConfigChange(field.key, cel)}
                    onRawChange={(raw) => onConfigChange(`${field.key}_raw`, raw ? "1" : "")}
                    pills={pills}
                    raw={step.config[`${field.key}_raw`] === "1"}
                    value={step.config[field.key] ?? ""}
                  />
                );
              }
              return null;
            }
            return (
              <Field
                field={field}
                key={field.key}
                onChange={(value) => onConfigChange(field.key, value)}
                pills={pills}
                value={step.config[field.key] ?? ""}
              />
            );
          })}

          {/* set_var: repeatable one-or-many assignment editor. */}
          {step.type === "set_var" ? (
            <SetVarEditor onConfigChange={onConfigChange} pills={pills} step={step} />
          ) : null}

          {/* wait_duration: structured combo, 365-day capped. */}
          {step.type === "wait_duration" ? (
            <DurationCombo
              onChange={(next) => writeDuration(next, onConfigChange)}
              parts={parseDurationParts(step.config)}
            />
          ) : null}

          {/* wait_until: absolute (pill/CEL) vs relative (combo) mode. */}
          {step.type === "wait_until" ? (
            <WaitUntilEditor onConfigChange={onConfigChange} pills={pills} step={step} />
          ) : null}

          {/* manual_approval: target picker, rule, escalation. */}
          {step.type === "manual_approval" ? (
            <ApprovalConfig onConfigChange={onConfigChange} step={step} />
          ) : null}

          {/* collect_input: form source / inline fields / assignee / escalation. */}
          {step.type === "collect_input" ? (
            <CollectInputConfig onConfigChange={onConfigChange} step={step} />
          ) : null}

          {/* http_request: Test query -> canned result dialog. */}
          {step.type === "http_request" ? (
            <TestResultButton
              buttonLabel="Test query"
              result={() => mockHttpResult(step)}
              title="HTTP request · test result"
            />
          ) : null}

          {/* webhook: Test connection -> canned result dialog. */}
          {step.type === "webhook" ? (
            <TestResultButton
              buttonLabel="Test connection"
              result={() => mockWebhookResult(step)}
              title="Webhook · test result"
            />
          ) : null}

          {/* map: OPTIONAL per-item child body. */}
          {step.type === "map" ? (
            <div className="grid gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-600">Per-item body (optional)</Label>
                {(step.children?.length ?? 0) > 0 ? (
                  <Button
                    className="h-6 px-1.5 text-[10px]"
                    onClick={() => onRemoveMapBody(step.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="size-3" /> remove body
                  </Button>
                ) : (
                  <Button
                    className="h-6 gap-1 px-1.5 text-[10px]"
                    onClick={() => onAddMapBody(step.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="size-3" /> add body
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                A plain map projects each item via the per-item expression. Add a body to run a
                sub-sequence per item instead.
              </p>
            </div>
          ) : null}

          {(spec?.fields.length ?? 0) === 0 && step.type !== "set_var" ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs italic text-slate-600">
              This verb has no configuration.
            </div>
          ) : null}

          {step.type === "entry" ? <EntryContractHint step={step} /> : null}

          {MERGEABLE_OWNERS.has(step.type) &&
          ((step.branches?.length ?? 0) > 0 || (step.children?.length ?? 0) > 0) ? (
            <LaneMergeEditor entryPoints={entryPoints} onLaneChange={onLaneChange} step={step} />
          ) : null}

          <div className="grid gap-1.5 border-t border-slate-100 pt-3">
            <Label className="text-xs text-slate-600">Author note (documentation)</Label>
            <Textarea
              className="min-h-16 text-xs"
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Why does this step exist? (not executed)"
              value={step.note ?? ""}
            />
          </div>

          <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-600">
            id: {step.id}
          </div>
        </div>
      </div>
    </aside>
  );
};
