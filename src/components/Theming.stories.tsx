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
import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, ReactNode } from "react";

import { createMockGateway, exampleWorkflows } from "../mock";
import { FlowDesigner } from "./FlowDesigner";
import { WorkflowList } from "./WorkflowList";

// Proof that the components are restyled purely by overriding the package's
// `--sfd-*` CSS variables — the same knob a consumer turns. The default look
// comes from the shipped `theme.css`; the panels below re-render the identical
// components with a handful of variables remapped to a generic violet/blue
// brand. No component code, className, or prop changes — only variable values.

/**
 * An alternate, brand-neutral palette expressed as `--sfd-*` overrides (R G B
 * channels). It remaps only the accent (`coral`), the branch accent (`teal`),
 * and the neutral (`slate`) families to a violet/blue set; every other token
 * (status colours, etc.) falls through to the shipped default. Exported so the
 * Storybook toolbar's "Brand" global can apply the same swap to any story.
 */
/* eslint-disable perfectionist/sort-objects -- grouped by colour family, not alphabetically */
export const altBrandTokens: Record<string, string> = {
  // Accent -> violet.
  "--sfd-coral-50": "245 243 255",
  "--sfd-coral-100": "237 233 254",
  "--sfd-coral-200": "221 214 254",
  "--sfd-coral-300": "196 181 253",
  "--sfd-coral-400": "167 139 250",
  "--sfd-coral-500": "139 92 246",
  "--sfd-coral-600": "124 58 237",
  "--sfd-coral-700": "109 40 217",
  // Neutral -> violet-tinted grey.
  "--sfd-slate-50": "250 250 255",
  "--sfd-slate-100": "244 244 253",
  "--sfd-slate-200": "230 230 247",
  "--sfd-slate-300": "208 208 235",
  "--sfd-slate-400": "158 158 200",
  "--sfd-slate-500": "112 112 160",
  "--sfd-slate-600": "80 80 120",
  "--sfd-slate-700": "55 55 95",
  "--sfd-slate-800": "35 35 70",
  "--sfd-slate-900": "20 20 45",
  // Branch accent -> blue.
  "--sfd-teal-50": "240 249 255",
  "--sfd-teal-100": "224 242 254",
  "--sfd-teal-200": "186 230 253",
  "--sfd-teal-300": "125 211 252",
  "--sfd-teal-400": "56 189 248",
  "--sfd-teal-500": "14 165 233",
  "--sfd-teal-600": "2 132 199",
  "--sfd-teal-700": "3 105 161",
  "--sfd-teal-800": "7 89 133",
};
/* eslint-enable perfectionist/sort-objects */

// A gateway + list props shared by both panels so the two palettes render the
// exact same content.
const gateway = createMockGateway();
const noop = (): undefined => undefined;
const listProps = {
  onCreate: noop,
  onDelete: noop,
  onOpenWorkflow: noop,
  onRestore: noop,
  onToggleEnabled: noop,
  workflows: exampleWorkflows,
};

// A subtree scoped to a set of `--sfd-*` overrides. Passing `undefined` renders
// the shipped default palette (no overrides).
const ThemeScope = ({
  children,
  label,
  tokens,
}: {
  children: ReactNode;
  label: string;
  tokens?: Record<string, string>;
}): ReactNode => (
  <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200">
    <header className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
      {label}
    </header>
    <div
      className="min-h-0 flex-1 overflow-auto bg-slate-50 text-slate-900"
      style={tokens as CSSProperties}
    >
      {children}
    </div>
  </section>
);

const meta: Meta = {
  parameters: { layout: "fullscreen" },
  // The theme swap is the subject; a props table adds nothing here.
  tags: ["!autodocs"],
  title: "Guides/Theming/Live Swap",
};

export default meta;

type Story = StoryObj;

/**
 * The same `WorkflowList`, side by side: the package's shipped default palette
 * on the left, the alternate brand (a few `--sfd-*` overrides) on the right.
 */
export const DefaultVsAlternate: Story = {
  render: () => (
    <div className="flex h-screen w-full gap-4 bg-white p-4">
      <ThemeScope label="Default theme (shipped)">
        <WorkflowList {...listProps} />
      </ThemeScope>
      <ThemeScope label="Alternate brand (overridden --sfd-* vars)" tokens={altBrandTokens}>
        <WorkflowList {...listProps} />
      </ThemeScope>
    </div>
  ),
};

/**
 * The full `FlowDesigner` rendered under the alternate brand — every surface,
 * accent, and status colour is driven by the overridden variables.
 */
export const FlowDesignerAlternateBrand: Story = {
  render: () => (
    <div
      className="h-screen w-full bg-slate-50 text-slate-900"
      style={altBrandTokens as CSSProperties}
    >
      <FlowDesigner definitionId="wf-order-fulfillment" gateway={gateway} />
    </div>
  ),
};
