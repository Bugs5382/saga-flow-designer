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
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "./cn";
import { mergeChildProps as mergeChildProperties } from "./slot";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

const useMenu = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) throw new Error("DropdownMenu subcomponents must be used within <DropdownMenu>");
  return context;
};

/**
 * A click-triggered dropdown menu. Compose with {@link DropdownMenuTrigger} and
 * {@link DropdownMenuContent}.
 *
 * @since 1.0.0
 */
export const DropdownMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const rootReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootReference.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block" ref={rootReference}>
        {children}
      </div>
    </MenuContext.Provider>
  );
};

/**
 * The control that opens/closes a {@link DropdownMenu}. With `asChild`, the
 * behaviour is merged onto the single child element.
 *
 * @since 1.0.0
 */
export const DropdownMenuTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) => {
  const context = useMenu();
  const onClick = () => context.setOpen(!context.open);
  if (asChild) return <>{mergeChildProperties(children, { onClick })}</>;
  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  );
};

/**
 * The floating panel of a {@link DropdownMenu}. Rendered only when open.
 *
 * @since 1.0.0
 */
export const DropdownMenuContent = ({
  align = "start",
  className,
  ...properties
}: { align?: "end" | "start" } & HTMLAttributes<HTMLDivElement>) => {
  const context = useMenu();
  if (!context.open) return null;
  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-1 min-w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
      role="menu"
      {...properties}
    />
  );
};

/**
 * A selectable row in a {@link DropdownMenuContent}. Closes the menu after
 * `onSelect` fires.
 *
 * @since 1.0.0
 */
export const DropdownMenuItem = ({
  children,
  className,
  disabled,
  onSelect,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: () => void;
}) => {
  const context = useMenu();
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-slate-700 outline-none",
        disabled ? "pointer-events-none opacity-50" : "hover:bg-slate-100 focus:bg-slate-100",
        className,
      )}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        context.setOpen(false);
      }}
      role="menuitem"
      type="button"
    >
      {children}
    </button>
  );
};

/**
 * A non-interactive heading within a {@link DropdownMenuContent}.
 *
 * @since 1.0.0
 */
export const DropdownMenuLabel = ({ className, ...properties }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-2 py-1.5 text-xs font-semibold text-slate-500", className)}
    {...properties}
  />
);

/**
 * A divider between {@link DropdownMenu} sections.
 *
 * @since 1.0.0
 */
export const DropdownMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("my-1 h-px bg-slate-100", className)} />
);
