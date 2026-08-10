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
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "./cn";
import { ChevronDown } from "./icons";

interface SelectContextValue {
  labels: Map<string, ReactNode>;
  onValueChange?: (value: string) => void;
  open: boolean;
  register: (value: string, label: ReactNode) => void;
  setOpen: (open: boolean) => void;
  value?: string;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

const useSelect = (): SelectContextValue => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("Select subcomponents must be used within <Select>");
  return context;
};

/**
 * Props for {@link Select}: a controlled single-value picker.
 *
 * @since 1.0.0
 */
export interface SelectProps {
  children: ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

/**
 * A minimal, dependency-free single-select. Compose it with
 * {@link SelectTrigger}, {@link SelectValue}, {@link SelectContent}, and
 * {@link SelectItem}. The selected item's rendered label is shown in the
 * trigger via {@link SelectValue}.
 *
 * @since 1.0.0
 */
export const Select = ({ children, onValueChange, value }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Map<string, ReactNode>>(new Map());
  const rootReference = useRef<HTMLDivElement>(null);

  const register = useCallback((itemValue: string, label: ReactNode) => {
    setLabels((previous) => {
      if (previous.has(itemValue)) return previous;
      const next = new Map(previous);
      next.set(itemValue, label);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootReference.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <SelectContext.Provider value={{ labels, onValueChange, open, register, setOpen, value }}>
      <div className="relative" ref={rootReference}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

/**
 * The button that opens/closes a {@link Select}. Wraps {@link SelectValue}.
 *
 * @since 1.0.0
 */
export const SelectTrigger = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useSelect();
  return (
    <button
      aria-expanded={context.open}
      aria-haspopup="listbox"
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
        className,
      )}
      onClick={() => context.setOpen(!context.open)}
      type="button"
    >
      {children}
      <ChevronDown className="size-4 shrink-0 opacity-60" />
    </button>
  );
};

/**
 * Displays the selected item's label in the trigger, or a placeholder.
 *
 * @since 1.0.0
 */
export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = useSelect();
  const label = context.value === undefined ? undefined : context.labels.get(context.value);
  const shown = label ?? context.value;
  return (
    <span className={cn("truncate", shown ? "" : "text-slate-400")}>{shown ?? placeholder}</span>
  );
};

/**
 * The dropdown panel of a {@link Select}. Its {@link SelectItem} children are
 * always mounted (hidden when closed) so their labels register for the trigger.
 *
 * @since 1.0.0
 */
export const SelectContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const context = useSelect();
  return (
    <div
      className={cn(
        "absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg",
        context.open ? "" : "hidden",
        className,
      )}
      role="listbox"
    >
      {children}
    </div>
  );
};

/**
 * A single option within a {@link SelectContent}.
 *
 * @since 1.0.0
 */
export const SelectItem = ({
  children,
  disabled,
  value,
}: {
  children: ReactNode;
  disabled?: boolean;
  value: string;
}) => {
  const context = useSelect();
  const { register } = context;
  useEffect(() => {
    if (!disabled) register(value, children);
  }, [value, disabled, children, register]);
  const selected = context.value === value;
  return (
    <button
      aria-selected={selected}
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
        disabled ? "pointer-events-none opacity-50" : "hover:bg-slate-100 focus:bg-slate-100",
        selected ? "font-medium text-teal-700" : "text-slate-700",
      )}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        context.onValueChange?.(value);
        context.setOpen(false);
      }}
      role="option"
      type="button"
    >
      {children}
    </button>
  );
};
