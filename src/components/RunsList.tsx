import type { WorkflowDefinition } from "../workflowData";

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
import {
  absoluteTime,
  formatDuration,
  relativeTime,
  type Run,
  type RunStatus,
  shortRunId,
} from "../runData";
import { Badge, DataTable, type ListColumn, PageHeader } from "./primitives";

// GLOBAL runs LIST — execution history across ALL workflows, newest-first (the
// caller supplies the ordered rows). One row per saga run; the Workflow column
// opens that flow's designer, the Run column opens the run detail — both through
// host-supplied callbacks. Props-driven and router-free.

const STATUS_STYLES: Record<RunStatus, string> = {
  cancelled: "bg-zinc-100 text-zinc-500 border-zinc-300",
  failed: "bg-rose-100 text-rose-700 border-rose-300",
  paused: "bg-sky-100 text-sky-700 border-sky-300",
  running: "bg-amber-100 text-amber-700 border-amber-300",
  succeeded: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

// A generic, domain-agnostic summary of the taken path.
const pathSummary = (run: Run): string => (run.path.length > 0 ? `${run.path.length} steps` : "—");

// Workflow display label, resolved from the supplied definitions (falls back to
// the run's denormalised key if the workflow is not provided).
const workflowLabel = (run: Run, byId: Record<string, WorkflowDefinition>): string =>
  byId[run.workflowId]?.label ?? run.workflowKey;

/**
 * Props for {@link RunsList}.
 *
 * @since 1.0.0
 */
export interface RunsListProps {
  // Open the run's detail view.
  onOpenRun?: (runId: string) => void;
  // Open the run's workflow (e.g. in the designer).
  onOpenWorkflow?: (workflowId: string) => void;
  // The runs to list, in display order (newest-first is conventional).
  runs: Run[];
  // Optional definitions keyed by id, used to resolve workflow labels.
  workflowsById?: Record<string, WorkflowDefinition>;
}

const buildColumns = (
  byId: Record<string, WorkflowDefinition>,
  onOpenRun?: (runId: string) => void,
  onOpenWorkflow?: (workflowId: string) => void,
): ListColumn<Run>[] => [
  {
    cell: (run) =>
      onOpenRun ? (
        <button
          className="font-mono text-xs text-teal-700 hover:underline"
          onClick={() => onOpenRun(run.id)}
          type="button"
        >
          {shortRunId(run.id)}
        </button>
      ) : (
        <span className="font-mono text-xs text-slate-600">{shortRunId(run.id)}</span>
      ),
    key: "id",
    label: "Run",
    plain: true,
    sortable: true,
    sortValue: (run) => run.id,
    width: 130,
  },
  {
    cell: (run) =>
      onOpenWorkflow ? (
        <button
          className="text-left text-teal-700 hover:underline"
          onClick={() => onOpenWorkflow(run.workflowId)}
          type="button"
        >
          <span className="font-medium">{workflowLabel(run, byId)}</span>
          <span className="ml-1 font-mono text-[11px] text-slate-400">{run.workflowKey}</span>
        </button>
      ) : (
        <span>
          <span className="font-medium">{workflowLabel(run, byId)}</span>
          <span className="ml-1 font-mono text-[11px] text-slate-400">{run.workflowKey}</span>
        </span>
      ),
    filterValue: (run) => workflowLabel(run, byId),
    key: "workflow",
    label: "Workflow",
    plain: true,
    sortable: true,
    sortValue: (run) => workflowLabel(run, byId),
    width: 220,
  },
  {
    cell: (run) => (
      <Badge className={STATUS_STYLES[run.status]} variant="outline">
        {run.status}
      </Badge>
    ),
    filterValue: (run) => run.status,
    key: "status",
    label: "Status",
    sortable: true,
    sortValue: (run) => run.status,
    width: 120,
  },
  {
    cell: (run) => <span className="text-slate-500">{run.trigger}</span>,
    key: "trigger",
    label: "Trigger",
    sortValue: (run) => run.trigger,
    width: 120,
  },
  {
    cell: (run) => (
      <span className="text-slate-500" title={absoluteTime(run.startedAt)}>
        {relativeTime(run.startedAt)}
        <span className="ml-1 text-[10px] text-slate-400">({absoluteTime(run.startedAt)})</span>
      </span>
    ),
    key: "started",
    label: "Started",
    sortable: true,
    sortValue: (run) => new Date(run.startedAt).getTime(),
  },
  {
    cell: (run) => (
      <span className="tabular-nums text-slate-500">
        {run.status === "running" || run.status === "paused"
          ? "in progress"
          : formatDuration(run.durationMs)}
      </span>
    ),
    key: "duration",
    label: "Duration",
    sortable: true,
    sortValue: (run) => run.durationMs ?? Number.MAX_SAFE_INTEGER,
    width: 110,
  },
  {
    cell: (run) => (
      <span className="truncate font-mono text-[11px] text-slate-600" title={pathSummary(run)}>
        {pathSummary(run)}
      </span>
    ),
    key: "path",
    label: "Path summary",
  },
];

/**
 * A global execution-history list: one row per saga run, with search, sort, and
 * pagination. Row and workflow activation are delegated to host callbacks.
 *
 * @since 1.0.0
 */
export const RunsList = ({
  onOpenRun,
  onOpenWorkflow,
  runs,
  workflowsById = {},
}: RunsListProps) => (
  <div className="flex flex-col gap-4 px-6 pb-10 pt-4">
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-black/5 bg-white px-5 py-4 shadow-sm">
      <PageHeader
        className="border-b-0 pb-0"
        eyebrow="Workflow"
        subtitle="Execution history across every workflow — one row per saga run, newest first."
        title="Runs"
      />
    </div>

    <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
      {runs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <div className="text-sm font-semibold text-slate-700">No runs yet</div>
          <p className="max-w-sm text-xs text-slate-500">
            No workflow has been executed. When the engine dispatches a run, its execution history
            appears here.
          </p>
        </div>
      ) : (
        <DataTable
          columns={buildColumns(workflowsById, onOpenRun, onOpenWorkflow)}
          defaultSortDirection="desc"
          defaultSortKey="started"
          getRowId={(run) => run.id}
          onRowClick={onOpenRun ? (run) => onOpenRun(run.id) : undefined}
          rows={runs}
        />
      )}
    </div>
  </div>
);
