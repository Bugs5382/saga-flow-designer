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
// Covers the `catalogOverrides` prop end-to-end on the REAL `FlowDesigner`
// (not just the catalog context in isolation): a host passing overrides sees
// them reach the palette through the `CatalogProvider` FlowDesigner renders
// internally, and a host passing none gets the unchanged base catalog.
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { FlowDesigner } from "../src/components/FlowDesigner";
import { createMockGateway, exampleWorkflows } from "../src/mock";

// jsdom has no ResizeObserver; @xyflow/react's canvas needs one to mount. A
// no-op stub is enough — this suite asserts on the palette, not layout.
beforeAll(() => {
  class ResizeObserverStub {
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
});

// A generic, non-domain-specific added verb — same shape used to characterize
// resolveCatalog()/CatalogProvider in the earlier catalog tests.
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

describe("FlowDesigner catalogOverrides prop", () => {
  afterEach(cleanup);

  it("threads add/hide overrides into the rendered palette", () => {
    render(
      <FlowDesigner
        catalogOverrides={{ add: [custom as never], hide: ["http_request"] }}
        definition={exampleWorkflows[0]}
        gateway={createMockGateway()}
      />,
    );

    // Each palette row has an "About <label>" info button — a unique,
    // unambiguous handle on the row per label (same convention as the
    // catalog-wiring characterization test).
    expect(screen.getByLabelText("About Custom X")).toBeTruthy();
    expect(screen.queryByLabelText("About HTTP Request")).toBeNull();
  });

  it("renders the base catalog unchanged when no overrides are given", () => {
    render(<FlowDesigner definition={exampleWorkflows[0]} gateway={createMockGateway()} />);

    expect(screen.getByLabelText("About HTTP Request")).toBeTruthy();
    expect(screen.queryByLabelText("About Custom X")).toBeNull();
  });
});
