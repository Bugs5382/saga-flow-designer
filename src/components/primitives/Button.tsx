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
import { type ButtonHTMLAttributes } from "react";

import { cn } from "./cn";

/**
 * Props for {@link Button}: native button attributes plus a `variant`/`size`.
 *
 * @since 1.0.0
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/**
 * Size preset of a {@link Button}.
 *
 * @since 1.0.0
 */
export type ButtonSize = "default" | "icon" | "sm";

/**
 * Visual style of a {@link Button}.
 *
 * @since 1.0.0
 */
export type ButtonVariant = "default" | "destructive" | "ghost" | "link" | "outline";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "bg-slate-800 text-white hover:bg-slate-700",
  destructive: "bg-rose-600 text-white hover:bg-rose-500",
  ghost: "text-slate-700 hover:bg-slate-100",
  link: "text-teal-700 underline-offset-4 hover:underline",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  icon: "size-9",
  sm: "h-8 px-3",
};

/**
 * A minimal, dependency-free button. Defaults to `type="button"` so it never
 * submits a form unless the caller opts in.
 *
 * @since 1.0.0
 */
export const Button = ({
  className,
  size = "default",
  type,
  variant = "default",
  ...properties
}: ButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
      VARIANT_CLASS[variant],
      SIZE_CLASS[size],
      className,
    )}
    type={type ?? "button"}
    {...properties}
  />
);
