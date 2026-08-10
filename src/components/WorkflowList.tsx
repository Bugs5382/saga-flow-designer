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

import { triggerSummary, type WorkflowDefinition, type WorkflowStatus } from "../workflowData";
import {
  Badge,
  Button,
  ConfirmDestructiveDialog,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type ListColumn,
  PageHeader,
} from "./primitives";
import { MoreVertical, Plus, Power, PowerOff, RotateCcw, Trash2 } from "./primitives/icons";

// Workflow · list of workflow definitions. Any system's workflows live here —
// the engine is domain-agnostic; record type / trigger are just data.
// Props-driven and router-free: lifecycle actions are delegated to the host.

const STATUS_STYLES: Record<WorkflowStatus, string> = {
  archived: "bg-zinc-100 text-zinc-500 border-zinc-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// A flow is enabled unless explicitly switched off (undefined = enabled).
const isEnabled = (workflow: WorkflowDefinition): boolean => workflow.enabled !== false;

// Pending confirmation for a destructive lifecycle action.
type Pending =
  | { kind: "delete"; workflow: WorkflowDefinition }
  | { kind: "restore"; workflow: WorkflowDefinition }
  | null;

const confirmMessageFor = (pending: Pending): string => {
  if (pending?.kind === "restore")
    return `Restore "${pending.workflow.label}" to the definition shipped by ${pending.workflow.systemSource ?? "its system"}? Any local modifications to this flow will be discarded.`;
  if (pending?.kind === "delete")
    return `Permanently delete "${pending.workflow.label}"? This cannot be undone.`;
  return "";
};

/**
 * Props for {@link WorkflowList}.
 *
 * @since 1.0.0
 */
export interface WorkflowListProps {
  // Mint a fresh draft flow (the host typically opens the designer after).
  onCreate?: () => void;
  // Hard-delete a user flow (system flows are restored, never deleted).
  onDelete?: (workflow: WorkflowDefinition) => void;
  // Open a flow (e.g. in the designer).
  onOpenWorkflow?: (workflowId: string) => void;
  // Restore a system flow to its shipped default.
  onRestore?: (workflow: WorkflowDefinition) => void;
  // Enable/disable a flow at the trigger.
  onToggleEnabled?: (workflow: WorkflowDefinition, enabled: boolean) => void;
  // The definitions to list.
  workflows: WorkflowDefinition[];
}

/**
 * A list of workflow definitions with search, sort, pagination, and a per-row
 * lifecycle menu (enable/disable, delete/restore). All mutations are delegated
 * to host callbacks so the host owns persistence and refresh.
 *
 * @since 1.0.0
 */
export const WorkflowList = ({
  onCreate,
  onDelete,
  onOpenWorkflow,
  onRestore,
  onToggleEnabled,
  workflows,
}: WorkflowListProps) => {
  const [pending, setPending] = useState<Pending>(null);

  const handleConfirm = () => {
    if (!pending) return;
    const { kind, workflow } = pending;
    setPending(null);
    if (kind === "delete") onDelete?.(workflow);
    else onRestore?.(workflow);
  };

  const columns: ListColumn<WorkflowDefinition>[] = [
    {
      cell: (workflow) =>
        onOpenWorkflow ? (
          <button
            className="font-mono text-xs text-teal-700 hover:underline"
            onClick={() => onOpenWorkflow(workflow.id)}
            type="button"
          >
            {workflow.key}
          </button>
        ) : (
          <span className="font-mono text-xs text-slate-600">{workflow.key}</span>
        ),
      filterValue: (workflow) => workflow.key,
      key: "key",
      label: "Key",
      plain: true,
      sortable: true,
      sortValue: (workflow) => workflow.key,
      width: 180,
    },
    {
      cell: (workflow) => (
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-700">{workflow.label}</span>
          {workflow.system ? (
            <Badge
              className="border-indigo-200 bg-indigo-50 text-[10px] text-indigo-600"
              title={`Shipped by ${workflow.systemSource ?? "a system"} — modify, disable or restore, but never delete.`}
              variant="outline"
            >
              System{workflow.systemSource ? ` · ${workflow.systemSource}` : ""}
            </Badge>
          ) : null}
        </span>
      ),
      filterValue: (workflow) => workflow.label,
      key: "label",
      label: "Workflow",
      sortable: true,
      sortValue: (workflow) => workflow.label,
    },
    {
      cell: (workflow) => (
        <span className="text-slate-500">{triggerSummary(workflow.trigger)}</span>
      ),
      key: "trigger",
      label: "Trigger",
      sortValue: (workflow) => triggerSummary(workflow.trigger),
    },
    {
      cell: (workflow) => <span className="tabular-nums text-slate-500">v{workflow.version}</span>,
      key: "version",
      label: "Version",
      sortable: true,
      sortValue: (workflow) => workflow.version,
      width: 90,
    },
    {
      cell: (workflow) => (
        <Badge className={STATUS_STYLES[workflow.status]} variant="outline">
          {workflow.status}
        </Badge>
      ),
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (workflow) => workflow.status,
    },
    {
      cell: (workflow) =>
        isEnabled(workflow) ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-300" /> Disabled
          </span>
        ),
      filterValue: (workflow) => (isEnabled(workflow) ? "Enabled" : "Disabled"),
      key: "enabled",
      label: "Firing",
      sortable: true,
      sortValue: (workflow) => (isEnabled(workflow) ? 0 : 1),
      width: 110,
    },
    {
      cell: (workflow) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Actions for ${workflow.label}`}
              className="size-7"
              size="icon"
              variant="ghost"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => onToggleEnabled?.(workflow, !isEnabled(workflow))}>
              {isEnabled(workflow) ? (
                <>
                  <PowerOff className="size-4" /> Disable
                </>
              ) : (
                <>
                  <Power className="size-4" /> Enable
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {workflow.system ? (
              <DropdownMenuItem onSelect={() => setPending({ kind: "restore", workflow })}>
                <RotateCcw className="size-4" /> Restore to default
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600"
                onSelect={() => setPending({ kind: "delete", workflow })}
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      key: "actions",
      label: "",
      plain: true,
      width: 56,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-6 pb-10 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-black/5 bg-white px-5 py-4 shadow-sm">
        <PageHeader
          className="border-b-0 pb-0"
          eyebrow="Workflow"
          subtitle="Orchestration definitions — authored in the Flow Designer, dispatched by the engine."
          title="Flows"
        />
        {onCreate ? (
          <Button className="shrink-0" onClick={onCreate}>
            <Plus className="size-4" /> New flow
          </Button>
        ) : null}
      </div>
      <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
        <DataTable
          columns={columns}
          getRowId={(workflow) => workflow.id}
          onRowClick={onOpenWorkflow ? (workflow) => onOpenWorkflow(workflow.id) : undefined}
          rows={workflows}
        />
      </div>

      <ConfirmDestructiveDialog
        confirmLabel={pending?.kind === "restore" ? "Restore" : "Delete"}
        message={confirmMessageFor(pending)}
        onCancel={() => setPending(null)}
        onConfirm={handleConfirm}
        open={pending !== null}
        title={pending?.kind === "restore" ? "Restore to default" : "Delete flow"}
      />
    </div>
  );
};
