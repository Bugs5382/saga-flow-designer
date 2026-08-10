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
import { cloneElement, isValidElement, type ReactNode } from "react";

type AnyProperties = Record<string, unknown>;

const isHandler = (key: string): boolean => key.startsWith("on") && key.length > 2;

/**
 * Merge props onto a single React element child, composing event handlers so
 * both the child's original handler and the injected one run. Supports the
 * `asChild` pattern (render behaviour onto a caller-supplied element) without a
 * third-party Slot implementation. Non-element children are returned unchanged.
 *
 * @param child - The child node to clone (must be a single React element).
 * @param props - Props to merge; `on*` handlers compose with the child's.
 * @returns The cloned element, or the original node when it is not an element.
 * @since 1.0.0
 */
export const mergeChildProps = (child: ReactNode, props: AnyProperties): ReactNode => {
  if (!isValidElement(child)) return child;
  const childProperties = child.props as AnyProperties;
  const merged: AnyProperties = { ...props };
  for (const key of Object.keys(props)) {
    const injected = props[key];
    const existing = childProperties[key];
    if (isHandler(key) && typeof injected === "function") {
      merged[key] = (...arguments_: unknown[]) => {
        if (typeof existing === "function") (existing as (...a: unknown[]) => void)(...arguments_);
        (injected as (...a: unknown[]) => void)(...arguments_);
      };
    }
  }
  return cloneElement(child, merged);
};
