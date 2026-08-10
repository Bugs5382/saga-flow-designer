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
import { createContext, type ReactNode, useContext, useState } from "react";

import { cn } from "./cn";
import { mergeChildProps as mergeChildProperties } from "./slot";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipCtx = createContext<TooltipContextValue | undefined>(undefined);

const useTooltip = (): TooltipContextValue => {
  const context = useContext(TooltipCtx);
  if (!context) throw new Error("Tooltip subcomponents must be used within <Tooltip>");
  return context;
};

/**
 * A no-op provider kept for API compatibility with common tooltip libraries.
 *
 * @since 1.0.0
 */
export const TooltipProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

/**
 * A hover/focus tooltip root. Compose with {@link TooltipTrigger} and
 * {@link TooltipContent}.
 *
 * @since 1.0.0
 */
export const Tooltip = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipCtx.Provider value={{ open, setOpen }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipCtx.Provider>
  );
};

/**
 * The element that reveals a {@link Tooltip} on hover/focus. With `asChild`, the
 * handlers are merged onto the single child element.
 *
 * @since 1.0.0
 */
export const TooltipTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) => {
  const context = useTooltip();
  const handlers = {
    onBlur: () => context.setOpen(false),
    onFocus: () => context.setOpen(true),
    onMouseEnter: () => context.setOpen(true),
    onMouseLeave: () => context.setOpen(false),
  };
  if (asChild) return <>{mergeChildProperties(children, handlers)}</>;
  return <span {...handlers}>{children}</span>;
};

/**
 * The floating label of a {@link Tooltip}. Rendered only while open.
 *
 * @since 1.0.0
 */
export const TooltipContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useTooltip();
  if (!context.open) return null;
  return (
    <span
      className={cn(
        "absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-normal rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg",
        className,
      )}
      role="tooltip"
    >
      {children}
    </span>
  );
};
