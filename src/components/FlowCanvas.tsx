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
import { type DragEvent } from "react";

import type { StepRun, StepRunStatus } from "../runData";

import { formatDuration } from "../runData";
import {
  type Branch,
  BRANCH_VERBS,
  FANOUT_VERBS,
  type LaneRole,
  laneRoleFor,
  type LaneSemantics,
  laneSemantics,
  LOOP_VERBS,
  PAUSE_VERBS,
  type Stage,
  type Step,
  stepSummary,
  type Trigger,
  triggerSummary,
  VERB_BY_NAME,
  type VerbName,
} from "../workflowData";
import {
  cn,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./primitives";
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  CornerDownLeft,
  CornerRightDown,
  Plus,
  StickyNote,
  Trash2,
} from "./primitives/icons";

// The Flow Designer canvas. Renders a WorkflowDefinition as top-to-bottom STAGE
// BANDS:
//   Pre-Stage (trigger) -> numbered work Stages -> End Stage.
// Inside each stage a vertical step sequence renders; step cards show a step
// number WITHIN their stage ("2.1", "2.2" ...). decision/switch render labelled
// branch lanes; parallel/foreach fan out isolated child trails — each trail
// EITHER ends on its own end-cap OR rejoins at the construct's built-in join
// ("end means end": control never flows from one trail into a sibling). Subtrees
// are collapsible. "+" affordances and drag drop-zones drive insertion.

/**
 * The interaction callbacks the canvas invokes for edit/insert/select actions.
 *
 * @since 1.0.0
 */
export interface CanvasCallbacks {
  canPaste: boolean;
  // Given a drop target, is the currently-dragged payload legal there?
  dropLegal: (target: InsertTarget, payload: string) => boolean;
  // Add a fresh empty work stage AFTER the given stage id (undefined = append as
  // the last work stage). Absent in run-mode.
  onAddStage?: (afterStageId?: string) => void;
  onCopy: (stepId: string) => void;
  onDelete: (stepId: string) => void;
  onDeleteCascade: (stepId: string) => void;
  onDropVerb: (target: InsertTarget, payload: string) => void; // drag drop
  onInsert: (target: InsertTarget) => void; // "+" clicked -> open palette
  onInsertRelative: (stepId: string, where: "above" | "below") => void;
  onPasteRelative: (stepId: string, where: "above" | "below") => void;
  // Manually remove an EMPTY work stage by id (never auto-removed — the user
  // must click this; only offered when the stage has no steps). Absent in run-mode.
  onRemoveStage?: (stageId: string) => void;
  onSelect: (id: string) => void;
  onToggleCollapse: (stepId: string) => void;
}

/**
 * Where an insert lands: a sequence (steps array identified by ownerId) + index.
 *
 * @since 1.0.0
 */
export interface InsertTarget {
  index: number; // insert position within that steps array
  ownerId: string; // stage id OR lane id whose `steps` array we insert into
}

/**
 * Read-only run overlay. When supplied, the canvas renders in RUN MODE: no
 * insert slots, no drag, no context menu, no collapse toggles — every step card
 * is tinted by its StepRun status. `byStep` maps a Step.id to its StepRun.
 *
 * @since 1.0.0
 */
export interface RunOverlay {
  byStep: Record<string, StepRun>;
}

interface CanvasProperties extends CanvasCallbacks {
  // Present only in run-detail; drives read-only run-mode rendering.
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  stages: Stage[];
  trigger: Trigger;
}

const DRAG_MIME = "application/x-saga-flow-verb";

const handleVerbDragOver = (e: DragEvent): void => {
  if (e.dataTransfer.types.includes(DRAG_MIME)) e.preventDefault();
};

const chipToneClass = (tone: "catch" | "false" | "neutral" | "true" | "try"): string => {
  if (tone === "true") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (tone === "false") return "bg-rose-100 text-rose-700 border-rose-300";
  if (tone === "try") return "bg-sky-100 text-sky-700 border-sky-300";
  if (tone === "catch") return "bg-rose-100 text-rose-700 border-rose-300";
  return "bg-slate-100 text-slate-600 border-slate-300";
};

const stageBandHeader = (
  isPre: boolean,
  isEnd: boolean,
  stageNumber: number | undefined,
  suffix: string,
): string => {
  if (isPre) return "Pre-Stage / Trigger";
  if (isEnd) return `End Stage${suffix}`;
  return `Stage ${stageNumber}${suffix}`;
};

const stageBandTone = (isPre: boolean, isEnd: boolean): string => {
  if (isPre) return "border-teal-200 bg-teal-50/30";
  if (isEnd) return "border-slate-300 bg-slate-100/50";
  return "border-slate-200 bg-white/50";
};

const stageBadgeTone = (isPre: boolean, isEnd: boolean): string => {
  if (isPre) return "bg-teal-600 text-white";
  if (isEnd) return "bg-slate-700 text-white";
  return "bg-slate-800 text-white";
};

const stageBadgeSubtitle = (isPre: boolean, isEnd: boolean): string => {
  if (isPre) return "always · trigger + data prep";
  if (isEnd) return "always · terminates the flow";
  return "work stage";
};

const stageNumberPrefix = (
  isPre: boolean,
  isEnd: boolean,
  stageNumber: number | undefined,
): string => {
  if (isPre) return "P";
  if (isEnd) return "E";
  return String(stageNumber);
};

const fanoutLanesOf = (fanoutStep: Step | undefined): Branch[] => {
  if (!fanoutStep) return [];
  return fanoutStep.branches?.length ? fanoutStep.branches : (fanoutStep.children ?? []);
};

// A short downward connector with an arrowhead, drawn between stacked cards.
const Connector = ({ tone = "slate" }: { tone?: "rose" | "slate" }) => (
  <div aria-hidden className="flex flex-col items-center">
    <div className={cn("h-5 w-px", tone === "rose" ? "bg-rose-300" : "bg-slate-300")} />
    <div
      className={cn(
        "-mt-1 size-2 rotate-45 border-b border-r",
        tone === "rose" ? "border-rose-300" : "border-slate-300",
      )}
    />
  </div>
);

// A clickable "+" insert affordance between cards / at a lane head. Doubles as a
// drop zone for dragged palette verbs (highlights only when the drop is legal).
const InsertSlot = ({
  cb,
  compact,
  target,
}: {
  cb: CanvasCallbacks;
  compact?: boolean;
  target: InsertTarget;
}) => {
  const onDrop = (e: DragEvent) => {
    const payload = e.dataTransfer.getData(DRAG_MIME);
    if (!payload) return;
    e.preventDefault();
    if (cb.dropLegal(target, payload)) cb.onDropVerb(target, payload);
  };
  return (
    <div
      className="group flex items-center justify-center"
      onDragOver={handleVerbDragOver}
      onDrop={onDrop}
    >
      <button
        aria-label="Insert step here"
        className={cn(
          "flex items-center gap-1 rounded-full border border-dashed text-[10px] font-medium transition-colors",
          "border-coral-300 bg-white text-coral-600 opacity-90 hover:border-coral-500 hover:text-coral-700 hover:opacity-100",
          "group-[.drop-ok]:border-emerald-400 group-[.drop-ok]:opacity-100",
          compact ? "px-1.5 py-0.5" : "px-2 py-1",
        )}
        onClick={() => cb.onInsert(target)}
        type="button"
      >
        <Plus className="size-3" /> insert
      </button>
    </div>
  );
};

const TriggerCard = ({ trigger }: { trigger: Trigger }) => (
  <div className="w-[300px] rounded-xl border-2 border-teal-300 bg-teal-50/70 px-4 py-3 shadow-sm">
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-teal-600 text-sm font-bold text-white">
        T
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
          Trigger
        </div>
        <div className="truncate text-sm font-semibold text-slate-800">{trigger.label}</div>
      </div>
    </div>
    <div className="mt-2 truncate rounded-md bg-white/70 px-2 py-1 font-mono text-[11px] text-teal-800">
      {triggerSummary(trigger)}
    </div>
  </div>
);

// The End terminal cap for the whole flow (bottom of the End Stage).
const EndCap = ({ label = "End" }: { label?: string }) => (
  <div className="rounded-full border-2 border-slate-400 bg-slate-800 px-5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
    {label}
  </div>
);

// A per-branch terminal cap (a trail that truly ends here, not a rejoin).
const BranchEndCap = () => (
  <div className="rounded-full border border-slate-400 bg-slate-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
    end
  </div>
);

// A per-lane merge cap: the explicit sub-entry this lane rejoins to (never an
// unconditional "rejoin" — it names the target entry).
const MergeCap = ({ label }: { label?: string }) => (
  <div className="rounded-md border border-teal-400 bg-teal-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-teal-700">
    merge -&gt; {label ?? "(pick entry)"}
  </div>
);

// A loop-back cap: the lane loops back to the construct's entry node.
const LoopBackCap = () => (
  <div className="rounded-md border border-teal-400 bg-teal-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-teal-700">
    loop back to entry
  </div>
);

// A mini entry node (teal / trigger-styled) rendered at a loop-body head. Marks
// the point iterations rejoin — echoes the pre-stage Trigger colour.
const LoopEntryNode = ({ label = "loop entry" }: { label?: string }) => (
  <div className="flex items-center gap-1.5 rounded-lg border-2 border-teal-300 bg-teal-50/80 px-2.5 py-1 shadow-sm">
    <span className="grid size-5 place-items-center rounded-md bg-teal-600 text-[10px] font-bold text-white">
      L
    </span>
    <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">{label}</span>
  </div>
);

// --- RUN-MODE styling -------------------------------------------------------
// A step card's tint in run-mode, by its StepRun status. `skipped`/absent cards
// are dimmed (an un-taken branch or a never-reached node). Selection styling is
// ignored in run-mode — nothing is selectable.
const runCardTone = (sr: StepRun | undefined): string => {
  switch (sr?.status) {
    case "failed": {
      return "border-rose-500 bg-rose-50 ring-2 ring-rose-300";
    }
    case "running": {
      return "border-amber-400 bg-amber-50 ring-2 ring-amber-300 animate-pulse";
    }
    case "skipped": {
      return "border-slate-200 bg-slate-50 opacity-45";
    }
    case "succeeded": {
      return "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200";
    }
    case "waiting": {
      return "border-amber-400 bg-amber-50 ring-1 ring-amber-200";
    }
    default: {
      // Not in this run at all — dim like a skipped node.
      return "border-slate-200 bg-slate-50 opacity-40";
    }
  }
};

const RUN_STATUS_BADGE: Record<StepRunStatus, string> = {
  failed: "bg-rose-100 text-rose-700 border-rose-300",
  running: "bg-amber-100 text-amber-700 border-amber-300",
  skipped: "bg-slate-100 text-slate-500 border-slate-300",
  succeeded: "bg-emerald-100 text-emerald-700 border-emerald-300",
  waiting: "bg-amber-100 text-amber-700 border-amber-300",
};

// A small status + duration badge shown on run-mode step cards.
const RunStepBadge = ({ sr }: { sr: StepRun | undefined }) => {
  if (!sr) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
        RUN_STATUS_BADGE[sr.status],
      )}
    >
      {sr.status}
      {sr.durationMs === undefined ? "" : ` · ${formatDuration(sr.durationMs)}`}
    </span>
  );
};

const cardTone = (step: Step, selected: boolean): string => {
  if (selected) return "border-coral-500 ring-2 ring-coral-300/60 bg-white";
  if (step.type === "entry") return "border-teal-300 bg-teal-50/70 hover:border-teal-400";
  if (PAUSE_VERBS.has(step.type)) return "border-amber-300 bg-amber-50/60 hover:border-amber-400";
  // Cancel is an ABORT terminal — keep it rose/danger. End is normal success —
  // give it neutral slate so the two read as distinct.
  if (step.type === "cancel" || step.type === "error")
    return "border-rose-300 bg-rose-50/60 hover:border-rose-400";
  if (step.type === "end") return "border-slate-400 bg-slate-100/70 hover:border-slate-500";
  if (BRANCH_VERBS.has(step.type) || FANOUT_VERBS.has(step.type))
    return "border-indigo-300 bg-indigo-50/50 hover:border-indigo-400";
  return "border-slate-200 bg-white hover:border-slate-300";
};

const iconTone = (step: Step): string => {
  if (step.type === "entry") return "bg-teal-600";
  if (PAUSE_VERBS.has(step.type)) return "bg-amber-500";
  if (step.type === "cancel" || step.type === "error") return "bg-rose-500";
  if (step.type === "end") return "bg-slate-700";
  if (BRANCH_VERBS.has(step.type) || FANOUT_VERBS.has(step.type)) return "bg-indigo-500";
  return "bg-slate-500";
};

const StepCard = ({
  cb,
  runOverlay,
  selectedId,
  step,
  stepNumber,
}: {
  cb: CanvasCallbacks;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  step: Step;
  stepNumber: string;
}) => {
  const spec = VERB_BY_NAME[step.type];
  const selected = step.id === selectedId;
  const collapsible = (step.branches?.length ?? 0) > 0 || (step.children?.length ?? 0) > 0;
  const runMode = Boolean(runOverlay);
  const sr = runOverlay?.byStep[step.id];

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData(DRAG_MIME, `move:${step.id}`);
    e.dataTransfer.effectAllowed = "move";
  };

  // The card body — shared between edit- and run-mode; the wrappers differ.
  const body = (
    <div
      className={cn(
        "relative w-[300px] rounded-xl border-2 px-4 py-3 text-left shadow-sm transition-colors",
        runMode ? runCardTone(sr) : cn("cursor-pointer", cardTone(step, selected)),
      )}
      draggable={!runMode}
      onClick={runMode ? undefined : () => cb.onSelect(step.id)}
      onDragStart={runMode ? undefined : onDragStart}
    >
      {/* step number badge */}
      <span className="absolute -left-2 -top-2 grid min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white shadow ring-1 ring-coral-700/30">
        {stepNumber}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg text-sm text-white",
            iconTone(step),
          )}
        >
          {spec?.icon ?? "•"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-800">{step.label}</div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {spec?.label ?? step.type}
          </div>
        </div>
        {step.note ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="grid size-5 place-items-center rounded-md bg-amber-100 text-amber-600">
                  <StickyNote className="size-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-xs">{step.note}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
        {!runMode && PAUSE_VERBS.has(step.type) ? (
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-800">
            pause
          </span>
        ) : null}
        {!runMode && collapsible ? (
          <button
            aria-label={step.collapsed ? "Expand" : "Collapse"}
            className="grid size-5 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              cb.onToggleCollapse(step.id);
            }}
            type="button"
          >
            {step.collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        ) : null}
        {runMode ? null : (
          <button
            aria-label="Delete step"
            className="grid size-5 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            onClick={(e) => {
              e.stopPropagation();
              cb.onDelete(step.id);
            }}
            title="Delete (right-click for delete + everything below)"
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2 truncate rounded-md bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
        {stepSummary(step)}
      </div>
      {runMode && sr ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <RunStepBadge sr={sr} />
        </div>
      ) : null}
      {runMode && sr?.output ? (
        <div
          className="mt-1 truncate rounded-md bg-white/70 px-2 py-1 text-[10px] text-slate-500"
          title={sr.output}
        >
          {sr.output}
        </div>
      ) : null}
      {runMode && sr?.error ? (
        <div
          className="mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] text-rose-700"
          title={sr.error}
        >
          {sr.error}
        </div>
      ) : null}
      {!runMode && step.collapsed && collapsible ? (
        <div className="mt-1 rounded-md border border-dashed border-indigo-200 bg-indigo-50/60 px-2 py-1 text-[10px] font-medium text-indigo-500">
          {collapsedSummary(step)}
        </div>
      ) : null}
    </div>
  );

  // Run-mode: no context menu, no drag, no selection — just the tinted card.
  if (runMode) return body;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{body}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={() => cb.onInsertRelative(step.id, "above")}>
          <CornerRightDown className="size-4" /> Insert above
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => cb.onInsertRelative(step.id, "below")}>
          <CornerDownLeft className="size-4" /> Insert below
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => cb.onCopy(step.id)}>
          <Copy className="size-4" /> Copy
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!cb.canPaste}
          onSelect={() => cb.onPasteRelative(step.id, "below")}
        >
          <Clipboard className="size-4" /> Paste below
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => cb.onDelete(step.id)}>
          <Trash2 className="size-4" /> Delete (re-stitch)
        </ContextMenuItem>
        {(step.branches?.length ?? 0) > 0 || (step.children?.length ?? 0) > 0 ? (
          <ContextMenuItem
            className="text-rose-600 focus:text-rose-700"
            onSelect={() => cb.onDeleteCascade(step.id)}
          >
            <Trash2 className="size-4" /> Delete + everything below
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
};

const collapsedSummary = (step: Step): string => {
  if ((step.branches?.length ?? 0) > 0)
    return `${step.branches!.length} branches: ${step.branches!.map((b) => b.caseLabel).join(", ")}`;
  if ((step.children?.length ?? 0) > 0) return `${step.type}: ${step.children!.length} trails`;
  return "";
};

// A branch/child lane: header chip + an optional loop-entry head + its own
// vertical sub-sequence, capped per its termination semantics.
//   end        -> BranchEndCap (default for decision/switch/parallel/join lanes)
//   merge      -> MergeCap naming the explicit sub-entry it rejoins
//   loop-back  -> LoopBackCap (foreach/while body, try_catch TRY)
//   forced-end -> BranchEndCap + "forced" hint (try_catch CATCH)
const Lane = ({
  branch,
  cb,
  entryNames,
  hoistStepId,
  numberPrefix,
  ownerJoin,
  ownerType,
  role,
  runOverlay,
  selectedId,
  showLoopEntry,
  tone,
}: {
  branch: Branch;
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  // When set, the step with this id in the lane's own sequence renders its CARD
  // only — its fan-out lanes are hoisted OUT and rendered as child nodes by the
  // caller (React Flow recursive tree). Threaded straight into Sequence.
  hoistStepId?: string;
  numberPrefix: string;
  ownerJoin?: string;
  ownerType: VerbName;
  role: LaneRole;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  // When true, render the mini loop-entry node at the body head (loop bodies).
  showLoopEntry?: boolean;
  tone: "catch" | "false" | "neutral" | "true" | "try";
}) => {
  const chip = chipToneClass(tone);
  const semantics: LaneSemantics = laneSemantics(ownerType, role, branch);
  // In run-mode, dim a lane whose steps were all skipped (the un-taken branch).
  const laneTaken =
    !runOverlay ||
    branch.steps.some((s) => {
      const st = runOverlay.byStep[s.id]?.status;
      return st !== undefined && st !== "skipped";
    });
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border-2 border-slate-200 bg-white/70 px-4 pb-4 pt-3 shadow-sm",
        runOverlay && !laneTaken ? "opacity-45" : "",
        runOverlay && laneTaken ? "border-emerald-300 bg-emerald-50/30" : "",
      )}
    >
      {/* Sub-stage header: "Stage 2a · True". Each branch is its OWN boxed
          sub-stage, so its content stays inside its box and reads as the
          continuation of that column. */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Stage {numberPrefix}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            chip,
          )}
        >
          {branch.caseLabel}
          {semantics === "end" || semantics === "forced-end" ? " · ends" : ""}
        </span>
      </div>
      {branch.cond ? (
        <div className="mt-1 max-w-[220px] truncate font-mono text-[10px] text-slate-400">
          {branch.cond}
        </div>
      ) : null}
      {/* Loop bodies rejoin an entry node rendered at the body head (teal). */}
      {showLoopEntry ? (
        <>
          <Connector />
          <LoopEntryNode label={`${ownerType === "while" ? "while" : "for-each"} entry`} />
        </>
      ) : null}
      <Connector />
      <Sequence
        cb={cb}
        entryNames={entryNames}
        hoistStepId={hoistStepId}
        numberPrefix={numberPrefix}
        ownerId={branch.id}
        runOverlay={runOverlay}
        selectedId={selectedId}
        steps={branch.steps}
      />
      {/* Per-trail terminus, by semantics. "end means end" — a terminal trail
          never reaches a join; a merging lane names its explicit sub-entry. */}
      <Connector tone={semantics === "end" || semantics === "forced-end" ? "rose" : "slate"} />
      {semantics === "merge" && (
        <MergeCap label={branch.merge ? entryNames[branch.merge.entryId] : undefined} />
      )}
      {semantics === "loop-back" && <LoopBackCap />}
      {semantics !== "merge" && semantics !== "loop-back" && <BranchEndCap />}
      {ownerType === "parallel" && semantics === "merge" ? (
        <div className="mt-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-indigo-500">
          join {ownerJoin ?? "wait-all"}
        </div>
      ) : null}
    </div>
  );
};

// Sub-letter a lane off its parent stage number: dotted-path lane numbering — a
// lane off "2.1" is "2.1.1", "2.1.2" ...; deeper fan-outs keep extending the
// path (e.g. "2.1.1.2"). No letter suffixes.
const laneNumberPrefix = (parentNumber: string, laneIndex: number): string =>
  `${parentNumber}.${laneIndex + 1}`;

// The tone for a lane header chip, from owner type + role + case label.
const laneTone = (
  ownerType: VerbName,
  role: LaneRole,
  caseLabel: string,
): "catch" | "false" | "neutral" | "true" | "try" => {
  if (ownerType === "try_catch") return role === "try" ? "try" : "catch";
  const upper = caseLabel.toUpperCase();
  if (upper === "TRUE") return "true";
  if (upper === "FALSE") return "false";
  return "neutral";
};

// Render a row of side-by-side lanes. Very-wide fan-outs (unlimited switch
// cases / parallel trails) SCROLL horizontally rather than clip — do not force
// center-justify when content overflows.
const LaneRow = ({
  cb,
  entryNames,
  lanes,
  loopBody,
  ownerJoin,
  ownerType,
  parentNumber,
  runOverlay,
  selectedId,
}: {
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  lanes: Branch[];
  loopBody?: boolean;
  ownerJoin?: string;
  ownerType: VerbName;
  parentNumber: string;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
}) => (
  <div className="w-full overflow-x-auto">
    {/* w-max + mx-auto centres when it fits but scrolls from the START (never
        clips the left edge) when the fan-out is wider than the canvas. */}
    <div className="mx-auto flex w-max flex-nowrap items-start gap-4 px-1 pb-1">
      {lanes.map((lane, laneIndex) => {
        const role = laneRoleFor(ownerType, laneIndex);
        return (
          <Lane
            branch={lane}
            cb={cb}
            entryNames={entryNames}
            key={lane.id}
            numberPrefix={laneNumberPrefix(parentNumber, laneIndex)}
            ownerJoin={ownerJoin}
            ownerType={ownerType}
            role={role}
            runOverlay={runOverlay}
            selectedId={selectedId}
            showLoopEntry={loopBody}
            tone={laneTone(ownerType, role, lane.caseLabel)}
          />
        );
      })}
    </div>
  </div>
);

// One vertical sequence of steps within a stage or lane. Recursively renders
// branch/child lanes (arbitrary nesting). `numberPrefix` builds the step number
// ("2" -> "2.1" -> "2.1.1"). `ownerId` is the id of the steps-array owner (stage
// or lane) for insert targeting.
const Sequence = ({
  cb,
  entryNames,
  hoistStepId,
  numberPrefix,
  ownerId,
  runOverlay,
  selectedId,
  steps,
}: {
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  // When set, the step with this id renders its CARD only — its fan-out lanes
  // are hoisted OUT of this band and rendered below it by the caller.
  hoistStepId?: string;
  numberPrefix: string;
  ownerId: string;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  steps: Step[];
}) => {
  const runMode = Boolean(runOverlay);
  if (steps.length === 0)
    return runMode ? (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-4 py-2 text-[11px] italic text-slate-400">
        no steps
      </div>
    ) : (
      <div className="flex flex-col items-center gap-1">
        <InsertSlot cb={cb} compact target={{ index: 0, ownerId }} />
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-4 py-2 text-[11px] italic text-slate-400">
          empty — insert a step
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      {steps.map((step, index) => {
        const branches = step.branches ?? [];
        const children = step.children ?? [];
        const number = numberPrefix ? `${numberPrefix}.${index + 1}` : `${index + 1}`;
        // In run-mode, always expand subtrees (never hide executed steps behind
        // an authored collapse state).
        const showSub = runMode || !step.collapsed;
        const isLoop = LOOP_VERBS.has(step.type);
        const isTryCatch = step.type === "try_catch";
        return (
          <div className="flex flex-col items-center" key={step.id}>
            {runMode && index !== 0 && <div className="h-2" />}
            {!runMode && index === 0 && (
              <InsertSlot cb={cb} compact target={{ index: 0, ownerId }} />
            )}
            {!runMode && index !== 0 && (
              <>
                <div className="h-2" />
                <InsertSlot cb={cb} compact target={{ index, ownerId }} />
              </>
            )}
            <Connector />
            <StepCard
              cb={cb}
              runOverlay={runOverlay}
              selectedId={selectedId}
              step={step}
              stepNumber={number}
            />

            {step.id === hoistStepId ? (
              <div className="mt-1 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                branches into sub-stages below
              </div>
            ) : null}

            {showSub && branches.length > 0 && step.id !== hoistStepId ? (
              <>
                <Connector />
                <LaneRow
                  cb={cb}
                  entryNames={entryNames}
                  lanes={branches}
                  ownerType={step.type}
                  parentNumber={number}
                  runOverlay={runOverlay}
                  selectedId={selectedId}
                />
              </>
            ) : null}

            {showSub && children.length > 0 && step.id !== hoistStepId ? (
              <>
                <Connector />
                {isTryCatch ? (
                  // TWO clearly-labelled columns: Try | Catch.
                  <div className="w-full overflow-x-auto">
                    <div className="mx-auto flex w-max flex-nowrap items-start gap-3 px-1 pb-1">
                      {children.map((child, laneIndex) => {
                        const role = laneRoleFor(step.type, laneIndex);
                        return (
                          <div className="flex flex-col items-center gap-1" key={child.id}>
                            <div
                              className={cn(
                                "rounded-md px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                                role === "try" ? "bg-sky-600 text-white" : "bg-rose-600 text-white",
                              )}
                            >
                              {role === "try" ? "Try" : "Catch"}
                            </div>
                            <Lane
                              branch={child}
                              cb={cb}
                              entryNames={entryNames}
                              numberPrefix={laneNumberPrefix(number, laneIndex)}
                              ownerType={step.type}
                              role={role}
                              runOverlay={runOverlay}
                              selectedId={selectedId}
                              tone={role === "try" ? "try" : "catch"}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <LaneRow
                    cb={cb}
                    entryNames={entryNames}
                    lanes={children}
                    loopBody={isLoop}
                    ownerJoin={step.config.join}
                    ownerType={step.type}
                    parentNumber={number}
                    runOverlay={runOverlay}
                    selectedId={selectedId}
                  />
                )}
              </>
            ) : null}
          </div>
        );
      })}
      {runMode ? null : (
        <>
          <div className="h-2" />
          <InsertSlot cb={cb} compact target={{ index: steps.length, ownerId }} />
        </>
      )}
    </div>
  );
};

// One stage band.
const StageBand = ({
  cb,
  entryNames,
  hoistStepId,
  runOverlay,
  selectedId,
  stage,
  stageNumber,
}: {
  cb: CanvasCallbacks;
  entryNames: Record<string, string>;
  // A top-level fan-out step to hoist below the band as sub-stage lanes.
  hoistStepId?: string;
  runOverlay?: RunOverlay;
  selectedId: string | undefined;
  stage: Stage;
  stageNumber: number | undefined;
}) => {
  const isPre = stage.kind === "pre-stage";
  const isEnd = stage.kind === "end-stage";
  // Only append the descriptive name when there is one (a fresh stage has none,
  // so we don't render "Stage 1 · Stage 1").
  const named = stage.name.trim();
  const suffix = named ? ` · ${named}` : "";
  const header = stageBandHeader(isPre, isEnd, stageNumber, suffix);
  const tone = stageBandTone(isPre, isEnd);
  const band = (
    <div className={cn("w-full rounded-2xl border-2 px-6 py-5", tone)}>
      <div className="mb-3 flex items-center gap-2">
        <button
          className={cn(
            "max-w-[240px] truncate rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-shadow",
            stageBadgeTone(isPre, isEnd),
            selectedId === stage.id
              ? "ring-2 ring-coral-400 ring-offset-1"
              : "cursor-pointer hover:opacity-90",
          )}
          onClick={() => cb.onSelect(stage.id)}
          type="button"
        >
          {header}
        </button>
        <span className="text-[10px] text-slate-400">{stageBadgeSubtitle(isPre, isEnd)}</span>
        {stage.kind === "stage" && stage.steps.length === 0 && !runOverlay && cb.onRemoveStage ? (
          <button
            aria-label="Delete empty stage"
            className="ml-auto grid size-5 place-items-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => cb.onRemoveStage?.(stage.id)}
            title="Delete this empty stage"
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-col items-center">
        {isPre ? (
          // The pre-stage runs before Stage 1 to shape the trigger payload.
          // It accepts data-manipulation steps only; the trigger card itself
          // is rendered by the parent above this band.
          <p className="mb-2 max-w-[280px] text-center text-[11px] italic text-slate-400">
            Optional data prep — set variables, transform, merge, filter, map.
          </p>
        ) : null}
        <Sequence
          cb={cb}
          entryNames={entryNames}
          hoistStepId={hoistStepId}
          numberPrefix={stageNumberPrefix(isPre, isEnd, stageNumber)}
          ownerId={stage.id}
          runOverlay={runOverlay}
          selectedId={selectedId}
          steps={stage.steps}
        />
      </div>
      {stage.kind !== "end-stage" && !runOverlay && cb.onAddStage ? (
        <div className="mt-3 flex justify-center">
          <button
            className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-slate-500 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700"
            onClick={() => cb.onAddStage?.(stage.id)}
            title="Insert a new work stage after this one"
            type="button"
          >
            <Plus className="size-3" /> Stage
          </button>
        </div>
      ) : null}
    </div>
  );
  // Run mode: no menu. Edit mode: right-click the stage -> rename / add / delete.
  if (runOverlay) return band;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{band}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => cb.onSelect(stage.id)}>Rename / configure</ContextMenuItem>
        {stage.kind !== "end-stage" && cb.onAddStage ? (
          <ContextMenuItem onSelect={() => cb.onAddStage?.(stage.id)}>
            <Plus className="size-4" /> Add stage after
          </ContextMenuItem>
        ) : null}
        {stage.kind === "stage" && stage.steps.length === 0 && cb.onRemoveStage ? (
          <ContextMenuItem
            className="text-rose-600 focus:text-rose-700"
            onSelect={() => cb.onRemoveStage?.(stage.id)}
          >
            <Trash2 className="size-4" /> Delete empty stage
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Build a stepId -> display-name map for every `entry` node in the flow, so a
// merging lane can name the sub-entry it rejoins to.
const collectEntryNames = (stages: Stage[]): Record<string, string> => {
  const names: Record<string, string> = {};
  const walk = (steps: Step[]): void => {
    for (const step of steps) {
      if (step.type === "entry") names[step.id] = step.config.name || step.label || step.id;
      for (const lane of [...(step.branches ?? []), ...(step.children ?? [])]) walk(lane.steps);
    }
  };
  for (const stage of stages) walk(stage.steps);
  return names;
};

/**
 * The DOM (non-React-Flow) rendering of a workflow definition as stacked stage
 * bands. Props-driven and used both for authoring (with callbacks) and for
 * read-only run overlays.
 *
 * @since 1.0.0
 */
export const FlowCanvas = ({
  runOverlay,
  selectedId,
  stages,
  trigger,
  ...callback
}: CanvasProperties) => {
  // Work stages get numbered 1..N in order (pre/end excluded from numbering).
  let workIndex = 0;
  const entryNames = collectEntryNames(stages);
  return (
    <div className="flex min-h-full w-full justify-center overflow-auto bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] px-8 py-10">
      {/* min-w keeps a comfortable column for the common case; individual wide
          fan-outs scroll horizontally inside their own overflow-x-auto wrapper,
          so the page body itself never scrolls sideways. */}
      <div className="flex w-full min-w-[640px] max-w-[880px] flex-col items-stretch gap-3">
        {stages.map((stage) => {
          const isWork = stage.kind === "stage";
          const stageNumber = isWork ? ++workIndex : undefined;
          // Offer "+ Stage" after a work stage AND after the pre-stage (so a
          // flow with no work stages can gain its first one). Never after the
          // end-stage. Hidden in run-mode.
          const canAddAfter =
            !runOverlay && callback.onAddStage && (isWork || stage.kind === "pre-stage");
          // Tree: if a work stage's LAST step fans out, hoist that fan-out's
          // lanes OUT below the band as sub-stage bands (Stage 2.1a / 2.1b ...),
          // rather than nesting them inside the parent Stage 2 box.
          const last = stage.steps.at(-1);
          const fanoutStep =
            isWork && last && ((last.branches?.length ?? 0) > 0 || (last.children?.length ?? 0) > 0)
              ? last
              : undefined;
          const fanoutLanes = fanoutLanesOf(fanoutStep);
          const fanoutNumber = fanoutStep ? `${stageNumber}.${stage.steps.length}` : "";
          return (
            <div className="flex w-full flex-col items-center gap-3" key={stage.id}>
              {stage.kind === "pre-stage" ? <TriggerCard trigger={trigger} /> : null}
              <StageBand
                cb={callback}
                entryNames={entryNames}
                hoistStepId={fanoutStep?.id}
                runOverlay={runOverlay}
                selectedId={selectedId}
                stage={stage}
                stageNumber={stageNumber}
              />
              {fanoutStep ? (
                <>
                  <Connector />
                  <LaneRow
                    cb={callback}
                    entryNames={entryNames}
                    lanes={fanoutLanes}
                    loopBody={LOOP_VERBS.has(fanoutStep.type)}
                    ownerJoin={fanoutStep.config.join}
                    ownerType={fanoutStep.type}
                    parentNumber={fanoutNumber}
                    runOverlay={runOverlay}
                    selectedId={selectedId}
                  />
                </>
              ) : null}
              {stage.kind === "end-stage" ? null : (
                <div className="flex flex-col items-center">
                  {canAddAfter ? (
                    <button
                      className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-slate-500 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700"
                      onClick={() => callback.onAddStage?.(stage.id)}
                      title="Insert a new work stage here"
                      type="button"
                    >
                      <Plus className="size-3" /> Stage
                    </button>
                  ) : null}
                  <Connector />
                </div>
              )}
            </div>
          );
        })}
        <div className="flex flex-col items-center">
          <EndCap />
        </div>
      </div>
    </div>
  );
};

export { DRAG_MIME };
// Reused by the React Flow canvas (FlowCanvasRF) so its custom nodes render the
// EXACT same elements — identical look, React Flow only supplies the viewport.
export { collectEntryNames, EndCap, Lane, laneNumberPrefix, StageBand, TriggerCard };
