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
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { cn } from "./cn";
import { mergeChildProps as mergeChildProperties } from "./slot";

interface ContextMenuContextValue {
  open: boolean;
  openAt: (point: Point) => void;
  point: Point;
  setOpen: (open: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

const ContextMenuCtx = createContext<ContextMenuContextValue | undefined>(undefined);

const useContextMenu = (): ContextMenuContextValue => {
  const context = useContext(ContextMenuCtx);
  if (!context) throw new Error("ContextMenu subcomponents must be used within <ContextMenu>");
  return context;
};

/**
 * A right-click (context) menu. Compose with {@link ContextMenuTrigger} and
 * {@link ContextMenuContent}.
 *
 * @since 1.0.0
 */
export const ContextMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const openAt = (next: Point) => {
    setPoint(next);
    setOpen(true);
  };
  return (
    <ContextMenuCtx.Provider value={{ open, openAt, point, setOpen }}>
      {children}
    </ContextMenuCtx.Provider>
  );
};

/**
 * The region that opens the {@link ContextMenu} on right-click. With `asChild`,
 * the handler is merged onto the single child element.
 *
 * @since 1.0.0
 */
export const ContextMenuTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) => {
  const context = useContextMenu();
  const onContextMenu = (event: ReactMouseEvent) => {
    event.preventDefault();
    context.openAt({ x: event.clientX, y: event.clientY });
  };
  if (asChild) return <>{mergeChildProperties(children, { onContextMenu })}</>;
  return <div onContextMenu={onContextMenu}>{children}</div>;
};

/**
 * The floating panel of a {@link ContextMenu}, positioned at the cursor.
 *
 * @since 1.0.0
 */
export const ContextMenuContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useContextMenu();
  useEffect(() => {
    if (!context.open) return;
    const close = () => context.setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") context.setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [context]);
  if (!context.open) return null;
  return (
    <div
      className={cn(
        "fixed z-50 min-w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
      role="menu"
      style={{ left: context.point.x, top: context.point.y }}
    >
      {children}
    </div>
  );
};

/**
 * A selectable row in a {@link ContextMenuContent}.
 *
 * @since 1.0.0
 */
export const ContextMenuItem = ({
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
  const context = useContextMenu();
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
 * A divider between {@link ContextMenu} sections.
 *
 * @since 1.0.0
 */
export const ContextMenuSeparator = ({ className }: { className?: string }) => (
  <div className={cn("my-1 h-px bg-slate-100", className)} />
);
