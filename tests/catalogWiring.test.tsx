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
// CHARACTERIZATION test for the catalog-context wiring refactor. It pins the
// designer's palette behavior for the BASE catalog: rendered inside a bare
// <CatalogProvider> (default base, no overrides), the VerbPalette must show
// EXACTLY the base catalog's entries, grouped by section in VERB_GROUP_ORDER.
// This guards that routing components through useCatalog() (instead of the
// module-global VERB_CATALOG / VERB_GROUP_ORDER) does not change what renders.
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogProvider } from "../src/catalogContext";
import { VerbPalette } from "../src/components/VerbPalette";
import { VERB_CATALOG, VERB_GROUP_ORDER } from "../src/workflowData";

// The base palette, grouped by section in group order — the source of truth this
// test characterizes. Within a group, entries keep VERB_CATALOG insertion order.
const expectedGroups = VERB_GROUP_ORDER.map((group) => ({
  group,
  labels: VERB_CATALOG.filter((verb) => verb.group === group).map((verb) => verb.label),
}));
const expectedLabelsInOrder = expectedGroups.flatMap((section) => section.labels);

describe("catalog wiring — VerbPalette renders the base catalog via context", () => {
  afterEach(cleanup);

  it("shows exactly the base catalog entries, in group order", () => {
    render(
      <CatalogProvider>
        <VerbPalette onAdd={() => {}} selectedStepId={undefined} />
      </CatalogProvider>,
    );

    // Every verb row has an "About <label>" info button; their DOM order is the
    // palette's rendered entry order. This must equal the group-ordered base.
    const rendered = screen
      .getAllByLabelText(/^About /)
      .map((element) => element.getAttribute("aria-label")!.replace(/^About /, ""));
    expect(rendered).toEqual(expectedLabelsInOrder);
  });

  it("renders each group header with its base entry count", () => {
    render(
      <CatalogProvider>
        <VerbPalette onAdd={() => {}} selectedStepId={undefined} />
      </CatalogProvider>,
    );

    for (const { group, labels } of expectedGroups) {
      // The group header button's accessible name is the group name + its count.
      const header = screen.getByRole("button", {
        name: new RegExp(String.raw`^${group}\s*${labels.length}$`),
      });
      expect(header).toBeTruthy();
    }
  });

  it("groups each entry under its own section header", () => {
    const { container } = render(
      <CatalogProvider>
        <VerbPalette onAdd={() => {}} selectedStepId={undefined} />
      </CatalogProvider>,
    );

    // Each group's wrapper <div> holds the header button then the entry rows;
    // assert the labels inside each section match that group's base entries.
    const basePanel = container.querySelector('[role="tabpanel"]')!;
    const sections = within(basePanel as HTMLElement).getAllByRole("button", {
      name: /\d$/,
    });
    // One header button per group, in order.
    expect(sections).toHaveLength(expectedGroups.length);
    for (const [index, header] of sections.entries()) {
      const { group } = expectedGroups[index];
      expect(header.textContent).toContain(group);
    }
  });
});
