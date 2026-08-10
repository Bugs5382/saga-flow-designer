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
import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "./cn";

/**
 * A single-line text input. All native input attributes pass through.
 *
 * @since 1.0.0
 */
export const Input = ({
  className,
  type,
  ...properties
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "flex w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-50",
      className,
    )}
    type={type ?? "text"}
    {...properties}
  />
);

/**
 * A multi-line text input. All native textarea attributes pass through.
 *
 * @since 1.0.0
 */
export const Textarea = ({
  className,
  ...properties
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-400 disabled:opacity-50",
      className,
    )}
    {...properties}
  />
);

/**
 * A form field label. All native label attributes pass through.
 *
 * @since 1.0.0
 */
export const Label = ({ className, ...properties }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium text-slate-700", className)} {...properties} />
);

/**
 * Props for {@link Switch}: a controlled on/off toggle.
 *
 * @since 1.0.0
 */
export interface SwitchProps {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * A controlled on/off toggle rendered as an accessible switch button.
 *
 * @since 1.0.0
 */
export const Switch = ({ checked, className, disabled, onCheckedChange }: SwitchProps) => (
  <button
    aria-checked={checked}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
      checked ? "bg-teal-500" : "bg-slate-300",
      className,
    )}
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    role="switch"
    type="button"
  >
    <span
      className={cn(
        "inline-block size-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0.5",
      )}
    />
  </button>
);
