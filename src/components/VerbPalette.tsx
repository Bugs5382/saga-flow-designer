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
import { type DragEvent, useState } from "react";

import {
  THIRD_PARTY_CATALOG,
  thirdPartyKey,
  VERB_CATALOG,
  VERB_GROUP_ORDER,
  type VerbGroup,
  type VerbSpec,
} from "../workflowData";
import { DRAG_MIME } from "./FlowCanvas";
import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./primitives";
import { ChevronDown, ChevronRight, Info } from "./primitives/icons";

// LEFT pane — the verb palette. Two tabs: Base (the built-in verbs, grouped) and
// 3rd-party (registered vendor extensions). Each verb row is clickable (insert
// after selection) and DRAGGABLE onto the canvas, with an info button opening a
// dialog describing the verb. When a target slot is active, verbs that are
// illegal there are flagged/disabled.

/**
 * Encode a palette drag/insert payload for a verb spec. Base verbs are keyed by
 * name; 3rd-party verbs by their synthetic key.
 *
 * @since 1.0.0
 */
export const encodeVerbPayload = (spec: VerbSpec, source: "base" | "third"): string =>
  `add:${source}:${source === "base" ? spec.name : thirdPartyKey(spec)}`;

/**
 * Props for {@link VerbPalette}.
 *
 * @since 1.0.0
 */
export interface PaletteProps {
  // Legality of each verb at the current insert/selection slot; undefined = no
  // active slot (all enabled but insertion falls back to "select a node first").
  legality?: (spec: VerbSpec) => { ok: boolean; reason?: string };
  onAdd: (spec: VerbSpec) => void;
  selectedStepId: string | undefined;
}

const GROUPED: Record<VerbGroup, VerbSpec[]> = {} as Record<VerbGroup, VerbSpec[]>;
for (const verb of VERB_CATALOG) {
  (GROUPED[verb.group] ??= []).push(verb);
}

const InfoDialog = ({
  onOpenChange,
  open,
  spec,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  spec: undefined | VerbSpec;
}) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    <DialogContent className="max-w-md">
      {spec ? (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-slate-100 text-base">
                {spec.icon}
              </span>
              {spec.label}
            </DialogTitle>
            <DialogDescription>{spec.description}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-xs font-semibold uppercase text-slate-600">
                Group
              </dt>
              <dd className="text-slate-700">{spec.group}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-xs font-semibold uppercase text-slate-600">
                Inputs
              </dt>
              <dd className="font-mono text-xs text-slate-700">{spec.inputs}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-xs font-semibold uppercase text-slate-600">
                Outputs
              </dt>
              <dd className="font-mono text-xs text-slate-700">{spec.outputs}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-xs font-semibold uppercase text-slate-600">
                Source
              </dt>
              <dd className="text-slate-700">
                {spec.source === "base" ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">built-in</span>
                ) : (
                  <span className="rounded bg-coral-100 px-1.5 py-0.5 text-xs text-coral-700">
                    3rd-party · {spec.vendor}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </>
      ) : null}
    </DialogContent>
  </Dialog>
);

const VerbRow = ({
  disabledHint,
  legality,
  onAdd,
  onInfo,
  source,
  spec,
}: {
  disabledHint: boolean;
  legality?: { ok: boolean; reason?: string };
  onAdd: (spec: VerbSpec) => void;
  onInfo: (spec: VerbSpec) => void;
  source: "base" | "third";
  spec: VerbSpec;
}) => {
  const illegal = legality && !legality.ok;
  const onDragStart = (e: DragEvent) => {
    if (illegal) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_MIME, encodeVerbPayload(spec, source));
    e.dataTransfer.effectAllowed = "copy";
  };
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-transparent bg-white px-2.5 py-2 shadow-sm transition-colors",
        illegal ? "cursor-not-allowed opacity-45" : "hover:border-coral-300 hover:bg-coral-50/50",
        disabledHint && !illegal && "opacity-70",
      )}
      draggable={!illegal}
      onDragStart={onDragStart}
      title={illegal ? legality?.reason : spec.summary}
    >
      <button
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        disabled={illegal}
        onClick={() => onAdd(spec)}
        type="button"
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs">
          {spec.icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-slate-700">
            {spec.label}
          </span>
          {source === "third" ? (
            <span className="block truncate text-[10px] text-slate-600">{spec.vendor}</span>
          ) : null}
        </span>
      </button>
      {illegal ? (
        <span className="rounded bg-rose-100 px-1 py-0.5 text-[8px] font-bold uppercase text-rose-600">
          n/a
        </span>
      ) : null}
      <button
        aria-label={`About ${spec.label}`}
        className="grid size-5 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-600"
        onClick={() => onInfo(spec)}
        type="button"
      >
        <Info className="size-3.5" />
      </button>
    </div>
  );
};

/**
 * The verb palette pane: grouped built-in verbs and registered 3rd-party
 * extensions, each clickable to insert or draggable onto the canvas.
 *
 * @since 1.0.0
 */
export const VerbPalette = ({ legality, onAdd, selectedStepId }: PaletteProps) => {
  const [collapsed, setCollapsed] = useState<Set<VerbGroup>>(new Set());
  const [infoSpec, setInfoSpec] = useState<undefined | VerbSpec>();
  const [infoOpen, setInfoOpen] = useState(false);

  const openInfo = (spec: VerbSpec) => {
    setInfoSpec(spec);
    setInfoOpen(true);
  };

  const toggle = (group: VerbGroup) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  const disabledHint = !selectedStepId && !legality;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/60">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-sm font-semibold text-slate-800">Verbs</div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          Click to insert at the active slot, or drag onto the canvas. Legal drops highlight;
          illegal verbs are flagged.
        </div>
      </div>
      <Tabs className="flex min-h-0 flex-1 flex-col" defaultValue="base">
        <TabsList className="mx-auto mt-2 w-fit">
          <TabsTrigger value="base">Base</TabsTrigger>
          <TabsTrigger value="third">3rd-party</TabsTrigger>
        </TabsList>

        <TabsContent
          className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-gutter:stable]"
          value="base"
        >
          {VERB_GROUP_ORDER.map((group) => {
            const verbs = GROUPED[group] ?? [];
            const isCollapsed = collapsed.has(group);
            return (
              <div className="mb-1" key={group}>
                <button
                  className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-200/60"
                  onClick={() => toggle(group)}
                  type="button"
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                  {group}
                  <span className="ml-auto text-slate-600">{verbs.length}</span>
                </button>
                {isCollapsed ? null : (
                  <div className="mt-1 grid gap-1">
                    {verbs.map((verb) => (
                      <VerbRow
                        disabledHint={disabledHint}
                        key={verb.name}
                        legality={legality?.(verb)}
                        onAdd={onAdd}
                        onInfo={openInfo}
                        source="base"
                        spec={verb}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent
          className="min-h-0 flex-1 overflow-y-auto px-2 py-2 [scrollbar-gutter:stable]"
          value="third"
        >
          <div className="mb-1">
            <div className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Extensions
              <span className="ml-auto text-slate-600">{THIRD_PARTY_CATALOG.length}</span>
            </div>
            <div className="mt-1 grid gap-1">
              {THIRD_PARTY_CATALOG.map((verb) => (
                <VerbRow
                  disabledHint={disabledHint}
                  key={thirdPartyKey(verb)}
                  legality={legality?.(verb)}
                  onAdd={onAdd}
                  onInfo={openInfo}
                  source="third"
                  spec={verb}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 px-2 text-[10px] leading-snug text-slate-600">
            Registered extension verbs contributed by vendor plug-ins; they map onto base dispatch
            at runtime.
          </p>
        </TabsContent>
      </Tabs>

      <InfoDialog onOpenChange={setInfoOpen} open={infoOpen} spec={infoSpec} />
    </aside>
  );
};
