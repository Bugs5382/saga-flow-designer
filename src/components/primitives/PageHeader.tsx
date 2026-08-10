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
import { type ReactNode } from "react";

import { cn } from "./cn";

/**
 * Props for {@link PageHeader}.
 *
 * @since 1.0.0
 */
export interface PageHeaderProps {
  className?: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

/**
 * A page/section header with an optional eyebrow and subtitle.
 *
 * @since 1.0.0
 */
export const PageHeader = ({ className, eyebrow, subtitle, title }: PageHeaderProps) => (
  <div className={cn("border-b border-slate-100 pb-3", className)}>
    {eyebrow ? (
      <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-600">
        {eyebrow}
      </div>
    ) : null}
    <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
  </div>
);
