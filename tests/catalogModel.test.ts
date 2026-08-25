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
import { describe, expect, it } from "vitest";

import { resolveCatalog } from "../src/catalogModel";
import { VERB_CATALOG } from "../src/workflowData";

const custom = {
  description: "",
  fields: [],
  group: "Custom",
  icon: "🔧",
  inputs: "",
  label: "Custom X",
  name: "custom_x",
  outputs: "",
  source: "base",
  summary: "",
} as const;

describe("resolveCatalog", () => {
  it("defaults to the base catalog with no overrides", () => {
    const r = resolveCatalog(VERB_CATALOG);
    expect(r.specs.length).toBe(VERB_CATALOG.length);
    expect(r.terminal.has("end")).toBe(true);
    expect(r.byName.end).toBeDefined();
  });

  it("adds custom entries and hides base ones", () => {
    const r = resolveCatalog(VERB_CATALOG, { add: [custom as never], hide: ["http_request"] });
    expect(r.byName.custom_x).toBeDefined();
    expect(r.byName.http_request).toBeUndefined();
    expect(r.groupOrder).toContain("Custom");
  });

  it("never hides a required verb", () => {
    const r = resolveCatalog(VERB_CATALOG, { hide: ["end"] });
    expect(r.byName.end).toBeDefined();
  });
});
