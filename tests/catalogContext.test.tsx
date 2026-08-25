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
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogProvider, useCatalog } from "../src/catalogContext";
import { VERB_CATALOG } from "../src/workflowData";

const custom = {
  description: "",
  fields: [],
  group: "Custom",
  icon: "C",
  inputs: "",
  label: "Custom X",
  name: "custom_x",
  outputs: "",
  source: "base",
  summary: "",
} as const;

const Probe = () => {
  const c = useCatalog();
  return (
    <div data-testid="p">{`${c.byName.custom_x ? "has-custom" : "no-custom"}|${c.specs.length}`}</div>
  );
};

describe("CatalogProvider / useCatalog", () => {
  afterEach(cleanup);

  it("defaults to the base catalog", () => {
    render(
      <CatalogProvider>
        <Probe />
      </CatalogProvider>,
    );
    expect(screen.getByTestId("p").textContent).toBe(`no-custom|${VERB_CATALOG.length}`);
  });

  it("applies add/hide overrides", () => {
    render(
      <CatalogProvider overrides={{ add: [custom as never], hide: [] }}>
        <Probe />
      </CatalogProvider>,
    );
    expect(screen.getByTestId("p").textContent).toBe(`has-custom|${VERB_CATALOG.length + 1}`);
  });

  it("useCatalog throws outside a provider", () => {
    expect(() => render(<Probe />)).toThrow();
  });
});
