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
// Pure-logic catalog overlay model: resolves an EFFECTIVE catalog from a base
// verb catalog plus `{ add, hide }` overrides, protecting required entries
// from being hidden. Behavior sets (terminal/branch/fanout/…) are DERIVED
// from each resolved spec's `behavior` hints rather than the hardcoded
// module-global `Set<VerbName>`s in workflowData — so a host that adds or
// hides catalog entries gets behavior sets that reflect what's ACTUALLY in
// the resolved catalog. No React; safe to unit-test in isolation.

import { type NodeGroup, VERB_GROUP_ORDER, type VerbBehavior, type VerbSpec } from "./workflowData";

/**
 * Overrides applied on top of a base catalog: entries to add, and base entry
 * names to hide. A hidden entry that is `behavior.required` is NEVER
 * actually hidden (see `resolveCatalog`).
 *
 * @since 1.0.0
 */
export interface CatalogOverrides {
  add?: VerbSpec[];
  hide?: string[];
}

/**
 * The result of resolving a base catalog + overrides: the effective spec
 * list/index/group order, plus the behavior sets derived from each resolved
 * spec's `behavior` hints.
 *
 * @since 1.0.0
 */
export interface ResolvedCatalog {
  branch: Set<string>;
  byName: Record<string, VerbSpec>;
  fanout: Set<string>;
  groupOrder: NodeGroup[];
  loop: Set<string>;
  mergeableOwners: Set<string>;
  pause: Set<string>;
  required: Set<string>;
  signalWait: Set<string>;
  specs: VerbSpec[];
  terminal: Set<string>;
}

/**
 * Resolve the effective catalog from a base catalog plus `{ add, hide }`
 * overrides.
 *   - A base entry named in `hide` is dropped UNLESS it is `behavior.required`
 *     (required entries can never be hidden — hiding one would leave a flow
 *     that cannot be validly constructed).
 *   - `add` entries are appended after the kept base entries (added entries
 *     win on name collision, since they come last in `specs`/`byName`).
 *   - `groupOrder` starts from the base `VERB_GROUP_ORDER`, then appends any
 *     group introduced by an added entry, in first-seen order.
 *   - The behavior sets (`terminal`, `branch`, …) are derived by scanning the
 *     RESOLVED specs' `behavior` hints — not the base catalog's hardcoded
 *     globals — so they reflect adds/hides too.
 *
 * @since 1.0.0
 */
export const resolveCatalog = (
  base: VerbSpec[],
  overrides: CatalogOverrides = {},
): ResolvedCatalog => {
  const hide = new Set(overrides.hide);
  const kept = base.filter((spec) => !hide.has(spec.name) || spec.behavior?.required);
  const specs = [...kept, ...(overrides.add ?? [])];

  const byName: Record<string, VerbSpec> = {};
  for (const spec of specs) byName[spec.name] = spec;

  const groupOrder: NodeGroup[] = [...VERB_GROUP_ORDER];
  for (const spec of specs) if (!groupOrder.includes(spec.group)) groupOrder.push(spec.group);

  const setFor = (key: keyof VerbBehavior): Set<string> =>
    new Set(specs.filter((spec) => spec.behavior?.[key]).map((spec) => spec.name));

  return {
    branch: setFor("branch"),
    byName,
    fanout: setFor("fanout"),
    groupOrder,
    loop: setFor("loop"),
    mergeableOwners: setFor("mergeableOwner"),
    pause: setFor("pause"),
    required: setFor("required"),
    signalWait: setFor("signalWait"),
    specs,
    terminal: setFor("terminal"),
  };
};
