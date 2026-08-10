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
 * The React component layer of the Flow Designer: embeddable, props-driven
 * surfaces the host wires up (no router, no application shell, no external UI
 * dependency). Domain/logic comes from the package's own logic core; UI is
 * built on the hand-rolled primitives in `./primitives`.
 *
 * The components use Tailwind utility classes — see `./README.md` for the
 * styling contract consumers must satisfy.
 *
 * @packageDocumentation
 * @since 1.0.0
 */

export {
  composeCondition,
  CONDITION_OPERATORS,
  ConditionBuilder,
  type ConditionBuilderProps,
  type ConditionParts,
  type OperatorSpec,
  parseCondition,
} from "./ConditionBuilder";
export { type CanvasCallbacks, FlowCanvas, type InsertTarget, type RunOverlay } from "./FlowCanvas";
export { FlowCanvasRF, type FlowCanvasRFProps } from "./FlowCanvasRF";
export {
  type DesignerNotice,
  type DesignerNoticeLevel,
  FlowDesigner,
  type FlowDesignerProps,
} from "./FlowDesigner";
export { type ConfigPanelProps, NodeConfigPanel } from "./NodeConfigPanel";
export { RunDetail, type RunDetailProps } from "./RunDetail";
export { RunsList, type RunsListProps } from "./RunsList";
export { encodeVerbPayload, type PaletteProps, VerbPalette } from "./VerbPalette";
export { WorkflowList, type WorkflowListProps } from "./WorkflowList";
