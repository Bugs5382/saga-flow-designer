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
// React seam over the pure-logic catalog overlay model (`./catalogModel`): a
// `CatalogProvider` resolves a base catalog + overrides ONCE (memoized) and
// publishes the result on context, so descendant components read the
// EFFECTIVE catalog via `useCatalog()` instead of importing the hardcoded
// `VERB_CATALOG` module global directly. A bare provider (no `base`, no
// `overrides`) reproduces today's base catalog exactly.

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { type CatalogOverrides, resolveCatalog, type ResolvedCatalog } from "./catalogModel";
import { VERB_CATALOG, type VerbSpec } from "./workflowData";

const CatalogContext = createContext<ResolvedCatalog | undefined>(undefined);

/**
 * Props for {@link CatalogProvider}.
 *
 * @since 1.0.0
 */
export interface CatalogProviderProps {
  base?: VerbSpec[];
  children: ReactNode;
  overrides?: CatalogOverrides;
}

/**
 * Resolves `base` (defaults to the package's {@link VERB_CATALOG}) plus
 * `overrides` into a {@link ResolvedCatalog} — memoized on `[base, overrides]`
 * so re-renders that don't change either reuse the same resolved catalog —
 * and publishes it on context for descendants to read via {@link useCatalog}.
 *
 * @since 1.0.0
 */
export const CatalogProvider = ({
  base = VERB_CATALOG,
  children,
  overrides,
}: CatalogProviderProps) => {
  const resolved = useMemo(() => resolveCatalog(base, overrides), [base, overrides]);

  return <CatalogContext.Provider value={resolved}>{children}</CatalogContext.Provider>;
};

/**
 * Reads the effective {@link ResolvedCatalog} published by the nearest
 * ancestor {@link CatalogProvider}. Throws if there is no such ancestor.
 *
 * @since 1.0.0
 */
export const useCatalog = (): ResolvedCatalog => {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog() must be used within a <CatalogProvider>.");
  return catalog;
};
