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

/**
 * Hand-rolled, dependency-free UI primitives used by the Flow Designer
 * components. These replace the design-system components the original source
 * imported, so the package carries no external UI dependency. They are styled
 * with Tailwind utility classes (see the components README for the styling
 * contract) and expose small, generic prop shapes.
 *
 * @packageDocumentation
 * @since 1.0.0
 */

export { Badge, type BadgeProps, type BadgeVariant } from "./Badge";
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";
export { type ClassValue, cn } from "./cn";
export {
  ConfirmDestructiveDialog,
  type ConfirmDestructiveDialogProps,
} from "./ConfirmDestructiveDialog";
export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ContextMenu";
export { DataTable, type DataTableProps, type ListColumn, type SortDirection } from "./DataTable";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
} from "./Dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
export { Input, Label, Switch, type SwitchProps, Textarea } from "./form";
export { PageHeader, type PageHeaderProps } from "./PageHeader";
export {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue,
} from "./Select";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
