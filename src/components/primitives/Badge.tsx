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
import { type HTMLAttributes } from "react";

import { cn } from "./cn";

/**
 * Props for {@link Badge}: native span attributes plus a `variant`.
 *
 * @since 1.0.0
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/**
 * Visual style of a {@link Badge}.
 *
 * @since 1.0.0
 */
export type BadgeVariant = "default" | "outline";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "border-transparent bg-slate-800 text-white",
  outline: "border-slate-200 text-slate-600",
};

/**
 * A small inline status label. Callers typically pass Tailwind colour classes
 * via `className` to tone it for a specific status.
 *
 * @since 1.0.0
 */
export const Badge = ({ className, variant = "default", ...properties }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
      VARIANT_CLASS[variant],
      className,
    )}
    {...properties}
  />
);
