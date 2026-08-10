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

/**
 * A class name value that {@link cn} can flatten: a string, or a falsy value
 * that is skipped (so `cond && "class"` and `cond ? "a" : undefined` both work).
 *
 * @since 1.0.0
 */
export type ClassValue = false | null | string | undefined;

/**
 * Join class-name fragments, skipping falsy values. A tiny, dependency-free
 * stand-in for `clsx` — enough for conditional Tailwind utility composition.
 *
 * @param parts - Class fragments; falsy entries are dropped.
 * @returns The space-joined class string.
 * @since 1.0.0
 */
export const cn = (...parts: ClassValue[]): string => parts.filter(Boolean).join(" ");
