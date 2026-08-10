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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ValidationResult, WorkflowGateway } from "../workflowGateway";

import {
  type Branch,
  THIRD_PARTY_CATALOG,
  thirdPartyKey,
  type Trigger,
  VERB_BY_NAME,
  VERB_CATALOG,
  type VerbSpec,
  type WorkflowDefinition,
  type WorkflowStatus,
} from "../workflowData";
import {
  entryPoints as computeEntryPoints,
  type Legality,
  pillsInScopeFor,
  type SlotContext,
  verbLegalAt,
  workflowHasEmitSignal,
} from "../workflowScope";
import { type CanvasCallbacks, type InsertTarget } from "./FlowCanvas";
import { FlowCanvasRF } from "./FlowCanvasRF";
import {
  addMapBody,
  addStage,
  cloneStepFresh,
  deleteCascade,
  deleteRestitch,
  findOwnerSteps,
  insertAt,
  locateStep,
  makeStep,
  moveStep,
  ownerInPreStage,
  patchLane,
  relativeTarget,
  removeMapBody,
  removeStage,
  targetHasFollowing,
} from "./internal/workflowEdit";
import { findStep, walkWorkflow } from "./internal/workflowTraverse";
import { NodeConfigPanel } from "./NodeConfigPanel";
import {
  Badge,
  Button,
  cn,
  ConfirmDestructiveDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "./primitives";
import {
  ArrowLeft,
  Check,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Redo2,
  Rocket,
  TriangleAlert,
  Undo2,
} from "./primitives/icons";
import { VerbPalette } from "./VerbPalette";

const STATUS_STYLES: Record<WorkflowStatus, string> = {
  archived: "bg-zinc-100 text-zinc-500 border-zinc-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

/**
 * A user-facing notice the designer emits (e.g. "Added Decision"). The host
 * decides how to present it (a toast, a live region, or nothing).
 *
 * @since 1.0.0
 */
export interface DesignerNotice {
  level: DesignerNoticeLevel;
  message: string;
}

/**
 * The severity of a designer notice surfaced through `onNotify`.
 *
 * @since 1.0.0
 */
export type DesignerNoticeLevel = "error" | "info" | "success";

/**
 * Props for {@link FlowDesigner}. Provide a `gateway` plus either an initial
 * `definition` or a `definitionId` to load through the gateway.
 *
 * @since 1.0.0
 */
export interface FlowDesignerProps {
  // Seed the editor with an already-loaded definition. Takes precedence over
  // `definitionId`. Treated as the initial working copy (edits are local).
  definition?: WorkflowDefinition;
  // Load the definition by id through the gateway when `definition` is absent.
  definitionId?: string;
  // The injected data-source seam. Save/validate go through this.
  gateway: WorkflowGateway;
  // Invoked when the back affordance is used. The back button is hidden when
  // this is omitted (the host owns navigation).
  onBack?: () => void;
  // Emitted for user-facing notices (add/delete/publish/etc.).
  onNotify?: (notice: DesignerNotice) => void;
  // Invoked with the published definition after a successful publish.
  onPublish?: (workflow: WorkflowDefinition) => void;
  // Invoked with the saved definition after each autosave.
  onSave?: (workflow: WorkflowDefinition) => void;
}

type SaveState = "dirty" | "idle" | "saved" | "saving";

// Resolve a palette drag/insert payload to its VerbSpec. Base verbs by name;
// 3rd-party verbs by synthetic key.
const specForPayload = (payload: string): undefined | VerbSpec => {
  const [, source, key] = payload.split(":");
  if (source === "base") return VERB_BY_NAME[key as VerbSpec["name"]];
  return THIRD_PARTY_CATALOG.find((s) => thirdPartyKey(s) === key);
};

/**
 * The Flow Designer: an embeddable, props-driven workflow editor composing the
 * verb palette, the React Flow canvas, and the node configuration panel. It owns
 * its working copy (undo/redo + debounced autosave through the injected
 * gateway); the host supplies navigation, notices, and persistence side effects.
 *
 * @since 1.0.0
 */
export const FlowDesigner = ({
  definition,
  definitionId,
  gateway,
  onBack,
  onNotify,
  onPublish,
  onSave,
}: FlowDesignerProps) => {
  // Keep host callbacks in refs so the memoised helpers below stay stable.
  const onNotifyReference = useRef(onNotify);
  onNotifyReference.current = onNotify;
  const onSaveReference = useRef(onSave);
  onSaveReference.current = onSave;
  const onPublishReference = useRef(onPublish);
  onPublishReference.current = onPublish;

  const notify = useMemo(
    () => ({
      error: (message: string) => onNotifyReference.current?.({ level: "error", message }),
      info: (message: string) => onNotifyReference.current?.({ level: "info", message }),
      success: (message: string) => onNotifyReference.current?.({ level: "success", message }),
    }),
    [],
  );

  const [workflow, setWorkflow] = useState<undefined | WorkflowDefinition>();
  const [notFound, setNotFound] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  // Header rename mode (flow label + key).
  const [editingHeader, setEditingHeader] = useState(false);

  // The "active slot" — set by clicking a "+" or via selection — decides where a
  // palette click inserts and drives palette legality flagging.
  const [activeSlot, setActiveSlot] = useState<InsertTarget | undefined>();

  // Collapse the verb palette (left) and/or config panel (right) to give the
  // canvas room on smaller screens (two-column fan-outs need the width).
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);

  // Undo/redo history of full working copies (bounded).
  const historyReference = useRef<{
    future: WorkflowDefinition[];
    past: WorkflowDefinition[];
  }>({
    future: [],
    past: [],
  });
  const [, forceHistory] = useState(0);

  // Copy buffer.
  const clipboardReference = useRef<
    undefined | WorkflowDefinition["stages"][number]["steps"][number]
  >(undefined);
  const [hasClip, setHasClip] = useState(false);

  // Publish/validation dialog.
  const [validation, setValidation] = useState<undefined | ValidationResult>();
  const [validationOpen, setValidationOpen] = useState(false);

  // Cascade-delete confirm.
  const [cascadeId, setCascadeId] = useState<string | undefined>();

  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    if (definition) {
      setWorkflow(structuredClone(definition));
      return () => {
        cancelled = true;
      };
    }
    if (!definitionId) return;
    void gateway.getWorkflow(definitionId).then((found) => {
      if (cancelled) return;
      if (found) setWorkflow(found);
      else setNotFound(true);
    });
    return () => {
      cancelled = true;
    };
  }, [definition, definitionId, gateway]);

  const selectedStep = useMemo(
    () => (workflow ? findStep(workflow.stages, selectedId ?? "") : undefined),
    [workflow, selectedId],
  );

  // A selected STAGE (its band was clicked) — drives the rename panel.
  const selectedStage = useMemo(
    () => workflow?.stages.find((s) => s.id === selectedId),
    [workflow, selectedId],
  );

  const pills = useMemo(
    () => (workflow ? pillsInScopeFor(workflow, selectedId) : []),
    [workflow, selectedId],
  );

  // Entry points available as merge targets for a rejoining lane.
  const entryPointList = useMemo(() => (workflow ? computeEntryPoints(workflow) : []), [workflow]);

  // --- autosave (debounced) -------------------------------------------------
  const scheduleSave = useCallback(
    (next: WorkflowDefinition) => {
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void gateway.saveWorkflow(next).then((saved) => {
          setSaveState("saved");
          onSaveReference.current?.(saved);
        });
      }, 600);
    },
    [gateway],
  );

  // Apply a mutation to a deep clone, push history, autosave.
  const mutate = useCallback(
    (function_: (draft: WorkflowDefinition) => void, options?: { noHistory?: boolean }) => {
      setWorkflow((current) => {
        if (!current) return current;
        if (!options?.noHistory) {
          historyReference.current.past.push(structuredClone(current));
          if (historyReference.current.past.length > 100) historyReference.current.past.shift();
          historyReference.current.future = [];
          forceHistory((n) => n + 1);
        }
        const draft = structuredClone(current) as WorkflowDefinition;
        function_(draft);
        scheduleSave(draft);
        return draft;
      });
    },
    [scheduleSave],
  );

  const undo = useCallback(() => {
    setWorkflow((current) => {
      const h = historyReference.current;
      if (!current || h.past.length === 0) return current;
      const previous = h.past.pop()!;
      h.future.push(structuredClone(current));
      forceHistory((n) => n + 1);
      scheduleSave(previous);
      return previous;
    });
  }, [scheduleSave]);

  const redo = useCallback(() => {
    setWorkflow((current) => {
      const h = historyReference.current;
      if (!current || h.future.length === 0) return current;
      const next = h.future.pop()!;
      h.past.push(structuredClone(current));
      forceHistory((n) => n + 1);
      scheduleSave(next);
      return next;
    });
  }, [scheduleSave]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // --- placement legality ---------------------------------------------------
  const slotContextFor = useCallback(
    (target: InsertTarget | undefined): SlotContext | undefined => {
      if (!workflow || !target) return undefined;
      return {
        hasEmitSignal: workflowHasEmitSignal(workflow),
        hasFollowing: targetHasFollowing(workflow, target.ownerId, target.index),
        inPreStage: ownerInPreStage(workflow, target.ownerId),
        scope: pillsInScopeFor(workflow), // scope at slot approximated by owner head
      };
    },
    [workflow],
  );

  const paletteLegality = useCallback(
    (spec: VerbSpec): Legality => {
      const context = slotContextFor(activeSlot);
      if (!context) return { ok: true };
      return verbLegalAt(spec, context);
    },
    [activeSlot, slotContextFor],
  );

  const dropLegal = useCallback(
    (target: InsertTarget, payload: string): boolean => {
      if (!workflow) return false;
      if (payload.startsWith("move:")) {
        // Reordering an existing node — allowed anywhere except into the
        // pre-stage, which accepts only data-manipulation steps.
        if (!ownerInPreStage(workflow, target.ownerId)) return true;
        const moved = locateStep(workflow, payload.slice("move:".length));
        return moved ? VERB_BY_NAME[moved.step.type]?.group === "Data" : false;
      }
      const spec = specForPayload(payload);
      const context = slotContextFor(target);
      if (!spec || !context) return false;
      return verbLegalAt(spec, context).ok;
    },
    [workflow, slotContextFor],
  );

  // --- edit ops -------------------------------------------------------------
  const insertSpecAt = useCallback(
    (spec: VerbSpec, target: InsertTarget) => {
      const context = slotContextFor(target);
      if (context && !verbLegalAt(spec, context).ok) {
        notify.error(verbLegalAt(spec, context).reason ?? "Not allowed here.");
        return;
      }
      const step = makeStep(spec);
      mutate((draft) => {
        const owner = findOwnerSteps(draft, target.ownerId);
        if (owner) insertAt(owner, target.index, step);
      });
      setSelectedId(step.id);
      setActiveSlot({ index: target.index + 1, ownerId: target.ownerId });
      notify.success(`Added ${spec.label}`);
    },
    [mutate, slotContextFor, notify],
  );

  // Palette click: insert at the active slot, else after the selected node.
  const handleAdd = useCallback(
    (spec: VerbSpec) => {
      if (activeSlot) {
        insertSpecAt(spec, activeSlot);
        return;
      }
      if (selectedId && workflow) {
        const rel = relativeTarget(workflow, selectedId, "below");
        if (rel) {
          insertSpecAt(spec, rel);
          return;
        }
      }
      notify.info("Click a “+” insert point (or select a node) first.");
    },
    [activeSlot, selectedId, workflow, insertSpecAt, notify],
  );

  const handleInsert = useCallback(
    (target: InsertTarget) => {
      setActiveSlot(target);
      notify.info("Insert point armed — pick a verb from the palette or drag one here.");
    },
    [notify],
  );

  const handleDropVerb = useCallback(
    (target: InsertTarget, payload: string) => {
      if (payload.startsWith("move:")) {
        const stepId = payload.slice("move:".length);
        mutate((draft) => {
          moveStep(draft, stepId, target.ownerId, target.index);
        });
        notify.success("Moved node");
        return;
      }
      const spec = specForPayload(payload);
      if (spec) insertSpecAt(spec, target);
    },
    [mutate, insertSpecAt, notify],
  );

  const handleInsertRelative = useCallback(
    (stepId: string, where: "above" | "below") => {
      if (!workflow) return;
      const rel = relativeTarget(workflow, stepId, where);
      if (rel) handleInsert(rel);
    },
    [workflow, handleInsert],
  );

  const handleDelete = useCallback(
    (stepId: string) => {
      mutate((draft) => {
        deleteRestitch(draft, stepId);
      });
      if (selectedId === stepId) setSelectedId(undefined);
      notify.success("Deleted (re-stitched successors)");
    },
    [mutate, selectedId, notify],
  );

  const handleDeleteCascade = useCallback((stepId: string) => {
    setCascadeId(stepId);
  }, []);

  const confirmCascade = useCallback(() => {
    if (!cascadeId) return;
    mutate((draft) => {
      deleteCascade(draft, cascadeId);
    });
    if (selectedId === cascadeId) setSelectedId(undefined);
    setCascadeId(undefined);
    notify.success("Deleted node and everything below it");
  }, [cascadeId, mutate, selectedId, notify]);

  const handleCopy = useCallback(
    (stepId: string) => {
      if (!workflow) return;
      const loc = locateStep(workflow, stepId);
      if (loc) {
        clipboardReference.current = structuredClone(loc.step);
        setHasClip(true);
        notify.success("Copied node");
      }
    },
    [workflow, notify],
  );

  const handlePasteRelative = useCallback(
    (stepId: string, where: "above" | "below") => {
      const buf = clipboardReference.current;
      if (!buf || !workflow) return;
      const target = relativeTarget(workflow, stepId, where);
      if (!target) return;
      const fresh = cloneStepFresh(buf);
      const context = slotContextFor(target);
      const spec = VERB_CATALOG.find((s) => s.name === fresh.type);
      if (context && spec && !verbLegalAt(spec, context).ok) {
        notify.error("Can't paste here: " + (verbLegalAt(spec, context).reason ?? ""));
        return;
      }
      mutate((draft) => {
        const owner = findOwnerSteps(draft, target.ownerId);
        if (owner) insertAt(owner, target.index, fresh);
      });
      setSelectedId(fresh.id);
      notify.success("Pasted node");
    },
    [workflow, mutate, slotContextFor, notify],
  );

  const handleToggleCollapse = useCallback(
    (stepId: string) => {
      mutate(
        (draft) => {
          const loc = locateStep(draft, stepId);
          if (loc) loc.step.collapsed = !loc.step.collapsed;
        },
        { noHistory: false },
      );
    },
    [mutate],
  );

  const handleTriggerChange = useCallback(
    (patch: Partial<Trigger>) => mutate((draft) => Object.assign(draft.trigger, patch)),
    [mutate],
  );

  // Enable/disable the flow at the trigger — a disabled flow keeps its
  // definition but never fires. Persists through the same autosave path.
  const handleEnabledChange = useCallback(
    (enabled: boolean) =>
      mutate((draft) => {
        draft.enabled = enabled;
      }),
    [mutate],
  );

  const handleLabelChange = useCallback(
    (label: string) =>
      mutate((draft) => {
        walkWorkflow(draft, (step) => {
          if (step.id === selectedId) step.label = label;
        });
      }),
    [mutate, selectedId],
  );

  const handleNoteChange = useCallback(
    (note: string) =>
      mutate((draft) => {
        walkWorkflow(draft, (step) => {
          if (step.id === selectedId) step.note = note;
        });
      }),
    [mutate, selectedId],
  );

  const handleConfigChange = useCallback(
    (key: string, value: string) =>
      mutate((draft) => {
        walkWorkflow(draft, (step) => {
          if (step.id === selectedId) step.config[key] = value;
        });
      }),
    [mutate, selectedId],
  );

  const handleLaneChange = useCallback(
    (laneId: string, patch: Partial<Branch>) =>
      mutate((draft) => {
        patchLane(draft, laneId, patch);
      }),
    [mutate],
  );

  const handleAddMapBody = useCallback(
    (stepId: string) =>
      mutate((draft) => {
        addMapBody(draft, stepId);
      }),
    [mutate],
  );

  const handleRemoveMapBody = useCallback(
    (stepId: string) =>
      mutate((draft) => {
        removeMapBody(draft, stepId);
      }),
    [mutate],
  );

  const handleSelect = useCallback((sid: string) => {
    setSelectedId(sid);
    setActiveSlot(undefined);
  }, []);

  // Inline-editable flow label + key in the header. Mutates + autosaves.
  const handleFlowLabelChange = useCallback(
    (label: string) => mutate((draft) => void (draft.label = label)),
    [mutate],
  );
  const handleFlowKeyChange = useCallback(
    (key: string) => mutate((draft) => void (draft.key = key)),
    [mutate],
  );

  // Add a fresh empty work stage (just before the End stage), then focus it.
  const handleAddStage = useCallback(
    (afterStageId?: string) => {
      let newStageId: string | undefined;
      mutate((draft) => {
        newStageId = addStage(draft, afterStageId);
      });
      if (newStageId) setActiveSlot({ index: 0, ownerId: newStageId });
      notify.success("Added a stage");
    },
    [mutate, notify],
  );

  // Manually delete an EMPTY work stage (the canvas only offers this when the
  // stage has no steps; empty stages are also auto-pruned on publish).
  const handleRemoveStage = useCallback(
    (stageId: string) => {
      mutate((draft) => {
        removeStage(draft, stageId);
      });
      notify.success("Removed empty stage");
    },
    [mutate, notify],
  );

  // Rename the selected stage — live via mutate/autosave.
  const handleStageRename = useCallback(
    (name: string) => {
      mutate((draft) => {
        const s = draft.stages.find((st) => st.id === selectedId);
        if (s) s.name = name;
      });
    },
    [mutate, selectedId],
  );

  // --- publish (validate-gated) --------------------------------------------
  const handlePublish = useCallback(() => {
    if (!workflow) return;
    // Empty work stages are auto-pruned on publish (never persisted empty) —
    // validate the pruned shape so a leftover empty stage can't fail publish.
    const isEmptyWorkStage = (s: WorkflowDefinition["stages"][number]) =>
      s.kind === "stage" && s.steps.length === 0;
    const pruned: WorkflowDefinition = {
      ...workflow,
      stages: workflow.stages.filter((s) => !isEmptyWorkStage(s)),
    };
    void gateway.validateWorkflow(pruned).then((result) => {
      setValidation(result);
      if (result.ok) {
        let published: undefined | WorkflowDefinition;
        mutate((draft) => {
          draft.stages = draft.stages.filter((s) => !isEmptyWorkStage(s));
          draft.status = "published";
          draft.version += 1;
          published = draft;
        });
        if (published) onPublishReference.current?.(published);
        notify.success("Published — validation passed.");
      } else {
        setValidationOpen(true);
        notify.error("Publish blocked — validation found errors.");
      }
    });
  }, [workflow, mutate, gateway, notify]);

  const canUndo = historyReference.current.past.length > 0;
  const canRedo = historyReference.current.future.length > 0;

  if (notFound)
    return (
      <div className="p-8">
        <p className="text-sm text-slate-600">Workflow not found.</p>
        {onBack ? (
          <Button className="mt-3" onClick={onBack} size="sm" variant="outline">
            <ArrowLeft className="size-4" /> Back to flows
          </Button>
        ) : null}
      </div>
    );

  if (!workflow) return <div className="p-8 text-sm text-slate-500">Loading…</div>;

  const canvasCallbacks: CanvasCallbacks = {
    canPaste: hasClip,
    dropLegal,
    onAddStage: handleAddStage,
    onCopy: handleCopy,
    onDelete: handleDelete,
    onDeleteCascade: handleDeleteCascade,
    onDropVerb: handleDropVerb,
    onInsert: handleInsert,
    onInsertRelative: handleInsertRelative,
    onPasteRelative: handlePasteRelative,
    onRemoveStage: handleRemoveStage,
    onSelect: handleSelect,
    onToggleCollapse: handleToggleCollapse,
  };

  const errorCount = validation?.issues.filter((index) => index.level === "error").length ?? 0;
  const warnCount = validation?.issues.filter((index) => index.level === "warning").length ?? 0;

  return (
    <div className="flex h-full flex-col">
      {/* TOP toolbar */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        {onBack ? (
          <Button onClick={onBack} size="icon" variant="ghost">
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        <div className="min-w-0">
          {editingHeader ? (
            <div className="flex items-center gap-2">
              <div className="grid gap-1">
                <Input
                  aria-label="Flow name"
                  autoFocus
                  className="h-7 w-64 text-sm font-semibold"
                  onChange={(event) => handleFlowLabelChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Escape") setEditingHeader(false);
                  }}
                  value={workflow.label}
                />
                <Input
                  aria-label="Flow key"
                  className="h-6 w-64 font-mono text-[11px] text-slate-500"
                  onChange={(event) => handleFlowKeyChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Escape") setEditingHeader(false);
                  }}
                  value={workflow.key}
                />
              </div>
              <Button
                className="h-7"
                onClick={() => setEditingHeader(false)}
                size="sm"
                variant="outline"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  className="group flex items-center gap-1.5 text-left"
                  onClick={() => setEditingHeader(true)}
                  title="Rename flow"
                  type="button"
                >
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {workflow.label}
                  </span>
                  <Pencil className="size-3 text-slate-300 group-hover:text-slate-500" />
                </button>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
                  v{workflow.version}
                </span>
                <Badge className={STATUS_STYLES[workflow.status]} variant="outline">
                  {workflow.status}
                </Badge>
                {workflow.system ? (
                  <Badge
                    className="border-indigo-200 bg-indigo-50 text-indigo-600"
                    title={`Shipped by ${workflow.systemSource ?? "a system"} — modify, disable or restore, but never delete.`}
                    variant="outline"
                  >
                    System
                    {workflow.systemSource ? ` · ${workflow.systemSource}` : ""}
                  </Badge>
                ) : null}
                {workflow.enabled === false ? (
                  <Badge className="border-slate-200 bg-slate-100 text-slate-500" variant="outline">
                    disabled
                  </Badge>
                ) : null}
              </div>
              <button
                className="truncate font-mono text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
                onClick={() => setEditingHeader(true)}
                title="Edit key"
                type="button"
              >
                {workflow.key}
              </button>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* autosave indicator */}
          <span
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
              saveState === "saving"
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600",
            )}
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check className="size-3" /> All changes saved
              </>
            )}
          </span>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <Button
              aria-label="Undo"
              disabled={!canUndo}
              onClick={undo}
              size="icon"
              variant="ghost"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              aria-label="Redo"
              disabled={!canRedo}
              onClick={redo}
              size="icon"
              variant="ghost"
            >
              <Redo2 className="size-4" />
            </Button>
          </div>

          <Button onClick={handlePublish} size="sm">
            <Rocket className="size-4" /> Publish
          </Button>
        </div>
      </div>

      {/* active-slot banner */}
      {activeSlot ? (
        <div className="flex items-center gap-2 border-b border-coral-200 bg-coral-50 px-4 py-1.5 text-[11px] text-coral-700">
          <span className="font-semibold">Insert point armed.</span> Pick a verb from the palette or
          drag one onto the highlighted slot.
          <Button
            className="ml-auto h-5 px-1.5 text-[10px]"
            onClick={() => setActiveSlot(undefined)}
            size="sm"
            variant="ghost"
          >
            cancel
          </Button>
        </div>
      ) : null}

      {/* Three panes — palette (left) and config panel (right) collapse to a
          thin rail so the canvas gets the width on smaller screens. */}
      <div className="flex min-h-0 flex-1">
        {paletteOpen ? (
          <div className="relative flex shrink-0">
            <button
              aria-label="Collapse verbs"
              className="absolute right-1 top-1 z-10 grid size-6 place-items-center rounded-md bg-white/80 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setPaletteOpen(false)}
              title="Collapse verbs"
              type="button"
            >
              <PanelLeftClose className="size-4" />
            </button>
            <VerbPalette
              legality={activeSlot ? paletteLegality : undefined}
              onAdd={handleAdd}
              selectedStepId={selectedId}
            />
          </div>
        ) : (
          <button
            aria-label="Show verbs"
            className="flex w-9 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white py-3 text-slate-500 hover:text-coral-600"
            onClick={() => setPaletteOpen(true)}
            title="Show verbs"
            type="button"
          >
            <PanelLeftOpen className="size-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wide [writing-mode:vertical-rl]">
              Verbs
            </span>
          </button>
        )}
        <main className="relative min-w-0 flex-1 overflow-hidden">
          <FlowCanvasRF
            flowId={workflow.id}
            selectedId={selectedId}
            stages={workflow.stages}
            trigger={workflow.trigger}
            {...canvasCallbacks}
          />
        </main>
        {panelOpen ? (
          <div className="relative flex shrink-0">
            <button
              aria-label="Collapse configuration panel"
              className="absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-md bg-white/80 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setPanelOpen(false)}
              title="Collapse panel"
              type="button"
            >
              <PanelRightClose className="size-4" />
            </button>
            <NodeConfigPanel
              enabled={workflow.enabled}
              entryPoints={entryPointList}
              onAddMapBody={handleAddMapBody}
              onConfigChange={handleConfigChange}
              onEnabledChange={handleEnabledChange}
              onLabelChange={handleLabelChange}
              onLaneChange={handleLaneChange}
              onNoteChange={handleNoteChange}
              onRemoveMapBody={handleRemoveMapBody}
              onStageRename={handleStageRename}
              onTriggerChange={handleTriggerChange}
              pills={pills}
              selectedStage={selectedStage}
              step={selectedStep}
              trigger={workflow.trigger}
            />
          </div>
        ) : (
          <button
            aria-label="Show configuration panel"
            className="flex w-9 shrink-0 flex-col items-center gap-2 border-l border-slate-200 bg-white py-3 text-slate-500 hover:text-coral-600"
            onClick={() => setPanelOpen(true)}
            title="Show configuration panel"
            type="button"
          >
            <PanelRightOpen className="size-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wide [writing-mode:vertical-rl]">
              Config
            </span>
          </button>
        )}
      </div>

      {/* Validation / publish-blocked dialog */}
      <Dialog onOpenChange={setValidationOpen} open={validationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-rose-500" /> Publish blocked
            </DialogTitle>
            <DialogDescription>
              Validation walks every possible path. Fix the errors below, then publish again.{" "}
              {errorCount} error(s), {warnCount} warning(s).
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-72 space-y-1 overflow-auto">
            {validation?.issues.map((issue, index) => (
              <li
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs",
                  issue.level === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
                key={index}
              >
                <span className="font-semibold uppercase">{issue.level}</span>{" "}
                {issue.stepId ? (
                  <button
                    className="underline decoration-dotted"
                    onClick={() => {
                      setSelectedId(issue.stepId);
                      setValidationOpen(false);
                    }}
                    type="button"
                  >
                    {issue.message}
                  </button>
                ) : (
                  issue.message
                )}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setValidationOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cascade-delete confirm */}
      <ConfirmDestructiveDialog
        confirmLabel="Delete everything below"
        message="This removes the node and its entire subtree (branch/child lanes and their steps). Nodes below it in the same sequence are preserved. This cannot be undone except via Undo."
        onCancel={() => setCascadeId(undefined)}
        onConfirm={confirmCascade}
        open={Boolean(cascadeId)}
        title="Delete node and everything below?"
      />
    </div>
  );
};
