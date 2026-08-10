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

interface TabsContextValue {
  setValue: (value: string) => void;
  value: string;
}

const TabsCtx = createContext<TabsContextValue | undefined>(undefined);

const useTabs = (): TabsContextValue => {
  const context = useContext(TabsCtx);
  if (!context) throw new Error("Tabs subcomponents must be used within <Tabs>");
  return context;
};

/**
 * A simple tab set. Compose with {@link TabsList}, {@link TabsTrigger}, and
 * {@link TabsContent}. Uncontrolled via `defaultValue`.
 *
 * @since 1.0.0
 */
export const Tabs = ({
  children,
  className,
  defaultValue,
}: {
  children: ReactNode;
  className?: string;
  defaultValue: string;
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsCtx.Provider value={{ setValue, value }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
};

/**
 * The row of {@link TabsTrigger} buttons.
 *
 * @since 1.0.0
 */
export const TabsList = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn("inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1", className)}
    role="tablist"
  >
    {children}
  </div>
);

/**
 * A single tab button that activates its matching {@link TabsContent}.
 *
 * @since 1.0.0
 */
export const TabsTrigger = ({
  children,
  className,
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) => {
  const context = useTabs();
  const active = context.value === value;
  return (
    <button
      aria-selected={active}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-white text-slate-800 shadow-sm" : "text-slate-500",
        className,
      )}
      onClick={() => context.setValue(value)}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
};

/**
 * The panel shown when its `value` matches the active tab.
 *
 * @since 1.0.0
 */
export const TabsContent = ({
  children,
  className,
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) => {
  const context = useTabs();
  if (context.value !== value) return null;
  return (
    <div className={className} role="tabpanel">
      {children}
    </div>
  );
};
