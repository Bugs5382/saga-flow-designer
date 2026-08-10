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
import { type HTMLAttributes, type ReactNode, useEffect } from "react";

import { cn } from "./cn";

/**
 * Props for {@link Dialog}: a controlled modal.
 *
 * @since 1.0.0
 */
export interface DialogProps {
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

/**
 * A controlled modal overlay. Renders nothing when closed; clicking the
 * backdrop or pressing Escape requests a close via `onOpenChange(false)`.
 *
 * @since 1.0.0
 */
export const Dialog = ({ children, onOpenChange, open }: DialogProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      {children}
    </div>
  );
};

/**
 * The panel of a {@link Dialog}. Stops backdrop clicks from closing it.
 *
 * @since 1.0.0
 */
export const DialogContent = ({ className, ...properties }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "grid w-full max-w-lg gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xl",
      className,
    )}
    onClick={(event) => event.stopPropagation()}
    role="dialog"
    {...properties}
  />
);

/**
 * The header region of a {@link DialogContent}.
 *
 * @since 1.0.0
 */
export const DialogHeader = ({ className, ...properties }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5", className)} {...properties} />
);

/**
 * The title of a {@link Dialog}.
 *
 * @since 1.0.0
 */
export const DialogTitle = ({ className, ...properties }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-base font-semibold text-slate-800", className)} {...properties} />
);

/**
 * The supporting description of a {@link Dialog}.
 *
 * @since 1.0.0
 */
export const DialogDescription = ({
  className,
  ...properties
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-500", className)} {...properties} />
);

/**
 * The footer (action row) of a {@link DialogContent}.
 *
 * @since 1.0.0
 */
export const DialogFooter = ({ className, ...properties }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-end gap-2", className)} {...properties} />
);
