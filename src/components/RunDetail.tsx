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
import { useEffect, useState } from "react";

import type { WorkflowDefinition } from "../workflowData";
import type { WorkflowGateway } from "../workflowGateway";

import {
  absoluteTime,
  formatDuration,
  relativeTime,
  type Run,
  type RunEvent,
  type RunStatus,
  type StepRun,
  stepRunsById,
  type StepRunStatus,
} from "../runData";
import { VERB_BY_NAME } from "../workflowData";
import { type CanvasCallbacks, FlowCanvas } from "./FlowCanvas";
import { Badge, Button, cn } from "./primitives";
import { ArrowLeft } from "./primitives/icons";

// Run DETAIL — the authored flow re-rendered through the READ-ONLY run-mode of
// FlowCanvas (runOverlay), colouring each step card by its StepRun status so you
// SEE the run on the flow. Alongside: an ordered step timeline (execution order)
// and the run-event audit log. Live via the gateway's subscribeRun. Props-driven.

const STATUS_STYLES: Record<RunStatus, string> = {
  cancelled: "bg-zinc-100 text-zinc-500 border-zinc-300",
  failed: "bg-rose-100 text-rose-700 border-rose-300",
  paused: "bg-sky-100 text-sky-700 border-sky-300",
  running: "bg-amber-100 text-amber-700 border-amber-300",
  succeeded: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const STEP_STATUS_STYLES: Record<StepRunStatus, string> = {
  failed: "bg-rose-100 text-rose-700",
  running: "bg-amber-100 text-amber-700",
  skipped: "bg-slate-100 text-slate-400",
  succeeded: "bg-emerald-100 text-emerald-700",
  waiting: "bg-amber-100 text-amber-700",
};

const STEP_DOT: Record<StepRunStatus, string> = {
  failed: "bg-rose-500",
  running: "bg-amber-500 animate-pulse",
  skipped: "bg-slate-300",
  succeeded: "bg-emerald-500",
  waiting: "bg-amber-500",
};

// A per-kind dot colour for the run-event audit log (replaces decorative
// glyphs so the source stays emoji-free).
const EVENT_DOT: Record<RunEvent["kind"], string> = {
  cancelled: "bg-zinc-400",
  completed: "bg-emerald-500",
  decision: "bg-indigo-500",
  error: "bg-rose-500",
  human_action: "bg-teal-500",
  paused: "bg-amber-500",
  resumed: "bg-sky-500",
  started: "bg-emerald-400",
  step: "bg-slate-400",
};

// Read-only no-op callbacks — run-mode never invokes them, but the prop is
// required by CanvasCallbacks. Kept inert so the editable designer contract is
// untouched.
const INERT: CanvasCallbacks = {
  canPaste: false,
  dropLegal: () => false,
  onCopy: () => {},
  onDelete: () => {},
  onDeleteCascade: () => {},
  onDropVerb: () => {},
  onInsert: () => {},
  onInsertRelative: () => {},
  onPasteRelative: () => {},
  onSelect: () => {},
  onToggleCollapse: () => {},
};

// The step timeline — stepRuns in EXECUTION order (the run's own path first,
// then any skipped steps that never ran, for completeness).
const StepTimeline = ({ run }: { run: Run }) => {
  const byId = stepRunsById(run);
  // Ordered: the taken path, then remaining (skipped) steps.
  const pathRows = run.path.map((sid) => byId[sid]).filter(Boolean) as StepRun[];
  const restRows = run.stepRuns.filter((sr) => !run.path.includes(sr.stepId));
  const rows = [...pathRows, ...restRows];
  return (
    <ol className="flex flex-col">
      {rows.map((sr, index) => {
        const spec = VERB_BY_NAME[sr.verb as keyof typeof VERB_BY_NAME];
        const last = index === rows.length - 1;
        return (
          <li className="relative flex gap-3 pb-4" key={sr.stepId}>
            {/* rail */}
            {last ? null : (
              <span aria-hidden className="absolute left-[11px] top-6 h-full w-px bg-slate-200" />
            )}
            <span className={cn("z-10 mt-1 size-6 shrink-0 rounded-full", STEP_DOT[sr.status])} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">{spec?.icon ?? "•"}</span>
                <span className="text-sm font-semibold text-slate-800">{sr.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    STEP_STATUS_STYLES[sr.status],
                  )}
                >
                  {sr.status}
                </span>
                {sr.durationMs === undefined ? null : (
                  <span className="text-[10px] tabular-nums text-slate-400">
                    {formatDuration(sr.durationMs)}
                  </span>
                )}
                <span
                  className="ml-auto text-[10px] text-slate-400"
                  title={absoluteTime(sr.startedAt)}
                >
                  {relativeTime(sr.startedAt)}
                </span>
              </div>
              {sr.output ? (
                <div className="mt-1 rounded-md bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600">
                  {sr.output}
                </div>
              ) : null}
              {sr.error ? (
                <div className="mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 font-mono text-[11px] text-rose-700">
                  {sr.error}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

// The run-event audit panel — who / what / when.
const RunEvents = ({ events }: { events: RunEvent[] }) => (
  <ol className="flex flex-col gap-2">
    {events.map((event, index) => (
      <li
        className="flex gap-2 rounded-md border border-slate-100 bg-white px-2.5 py-2"
        key={index}
      >
        <span
          aria-hidden
          className={cn("mt-1 size-2 shrink-0 rounded-full", EVENT_DOT[event.kind])}
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-700">{event.message}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
            {event.actor ? <span className="font-medium text-slate-500">{event.actor}</span> : null}
            <span title={absoluteTime(event.at)}>{absoluteTime(event.at)}</span>
          </div>
        </div>
      </li>
    ))}
  </ol>
);

/**
 * Props for {@link RunDetail}.
 *
 * @since 1.0.0
 */
export interface RunDetailProps {
  // The injected data-source seam. The run is loaded and streamed through this.
  gateway: WorkflowGateway;
  // Invoked when the back affordance is used (hidden when omitted).
  onBack?: () => void;
  // Open the run's workflow (e.g. in the designer).
  onOpenWorkflow?: (workflowId: string) => void;
  // The run to display.
  runId: string;
}

/**
 * The run detail view: the authored flow with a read-only status overlay, a
 * step timeline, and the run-event audit log. Subscribes to the gateway's live
 * run stream for the duration of the mount. Props-driven and router-free.
 *
 * @since 1.0.0
 */
export const RunDetail = ({ gateway, onBack, onOpenWorkflow, runId }: RunDetailProps) => {
  const [workflow, setWorkflow] = useState<undefined | WorkflowDefinition>();
  const [run, setRun] = useState<Run | undefined>();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    // Resolve the run first, then load its workflow (by run.workflowId) to draw
    // the executed-path overlay on the flow's canvas.
    void gateway.getRun(runId).then((r) => {
      if (cancelled) return;
      if (!r) {
        setNotFound(true);
        return;
      }
      setRun(r);
      void gateway.getWorkflow(r.workflowId).then((wf) => {
        if (cancelled) return;
        if (wf) setWorkflow(wf);
        else setNotFound(true);
      });
    });
    // …and tail the LIVE run stream: the gateway folds each frame into a fresh
    // Run and pushes it straight into state. Unsubscribe (close the socket) on
    // unmount / run change.
    const unsubscribe = gateway.subscribeRun(runId, setRun);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [runId, gateway]);

  if (notFound)
    return (
      <div className="p-8">
        <p className="text-sm text-slate-600">Run not found.</p>
        {onBack ? (
          <Button className="mt-3" onClick={onBack} size="sm" variant="outline">
            <ArrowLeft className="size-4" /> Back to runs
          </Button>
        ) : null}
      </div>
    );

  if (!workflow || !run) return <div className="p-8 text-sm text-slate-500">Loading…</div>;

  const overlay = { byStep: stepRunsById(run) };
  const inProgress = run.status === "running" || run.status === "paused";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        {onBack ? (
          <Button onClick={onBack} size="icon" variant="ghost">
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenWorkflow ? (
              <button
                className="truncate text-sm font-semibold text-slate-800 hover:text-teal-700 hover:underline"
                onClick={() => onOpenWorkflow(workflow.id)}
                type="button"
              >
                {workflow.label}
              </button>
            ) : (
              <span className="truncate text-sm font-semibold text-slate-800">
                {workflow.label}
              </span>
            )}
            <span className="font-mono text-[11px] text-slate-500">{run.id}</span>
            <Badge className={STATUS_STYLES[run.status]} variant="outline">
              {run.status}
            </Badge>
            {inProgress ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                live
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>trigger {run.trigger}</span>
            <span>· started {absoluteTime(run.startedAt)}</span>
            {run.finishedAt ? <span>· finished {absoluteTime(run.finishedAt)}</span> : null}
            <span>· {inProgress ? "in progress" : `took ${formatDuration(run.durationMs)}`}</span>
          </div>
        </div>
      </div>

      {/* Two panes: canvas (run overlay) + side rail (timeline + events) */}
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-2 text-[11px] text-slate-500">
            Executed path highlighted on the flow.
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-emerald-500" /> succeeded
            </span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-rose-500" /> failed
            </span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-amber-500" /> running / waiting
            </span>
            <span className="ml-2 inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-slate-300" /> skipped
            </span>
          </div>
          <FlowCanvas
            runOverlay={overlay}
            selectedId={undefined}
            stages={workflow.stages}
            trigger={workflow.trigger}
            {...INERT}
          />
        </main>

        <aside className="flex w-[380px] shrink-0 flex-col overflow-auto border-l border-slate-200 bg-white">
          <section className="border-b border-slate-100 p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Step timeline
            </h2>
            <StepTimeline run={run} />
          </section>
          <section className="p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Run events
            </h2>
            <RunEvents events={run.events} />
          </section>
        </aside>
      </div>
    </div>
  );
};
