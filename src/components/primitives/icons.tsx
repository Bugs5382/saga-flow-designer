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

import { type SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const Svg = ({ children, ...properties }: IconProps) => (
  <svg
    fill="none"
    height={16}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={16}
    xmlns="http://www.w3.org/2000/svg"
    {...properties}
  >
    {children}
  </svg>
);

/** ArrowLeft icon. @since 1.0.0 */
export const ArrowLeft = (properties: IconProps) => (
  <Svg {...properties}>
    <line x1={19} x2={5} y1={12} y2={12} />
    <polyline points="12 19 5 12 12 5" />
  </Svg>
);

/** Check icon. @since 1.0.0 */
export const Check = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

/** ChevronDown icon. @since 1.0.0 */
export const ChevronDown = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

/** ChevronRight icon. @since 1.0.0 */
export const ChevronRight = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="9 6 15 12 9 18" />
  </Svg>
);

/** Clipboard icon. @since 1.0.0 */
export const Clipboard = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={4} rx={1} width={8} x={8} y={2} />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </Svg>
);

/** Copy icon. @since 1.0.0 */
export const Copy = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={13} rx={2} width={13} x={9} y={9} />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

/** CornerDownLeft icon. @since 1.0.0 */
export const CornerDownLeft = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </Svg>
);

/** CornerRightDown icon. @since 1.0.0 */
export const CornerRightDown = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="10 15 15 20 20 15" />
    <path d="M4 4h7a4 4 0 0 1 4 4v12" />
  </Svg>
);

/** FlaskConical icon. @since 1.0.0 */
export const FlaskConical = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M10 2v7.31L4.5 18.6A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.7-3.4L14 9.31V2" />
    <line x1={8.5} x2={15.5} y1={2} y2={2} />
    <line x1={7} x2={17} y1={16} y2={16} />
  </Svg>
);

/** Info icon. @since 1.0.0 */
export const Info = (properties: IconProps) => (
  <Svg {...properties}>
    <circle cx={12} cy={12} r={10} />
    <line x1={12} x2={12} y1={16} y2={12} />
    <line x1={12} x2={12.01} y1={8} y2={8} />
  </Svg>
);

/** Loader2 spinner icon. @since 1.0.0 */
export const Loader2 = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Svg>
);

/** MoreVertical icon. @since 1.0.0 */
export const MoreVertical = (properties: IconProps) => (
  <Svg {...properties}>
    <circle cx={12} cy={5} r={1} />
    <circle cx={12} cy={12} r={1} />
    <circle cx={12} cy={19} r={1} />
  </Svg>
);

/** PanelLeftClose icon. @since 1.0.0 */
export const PanelLeftClose = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <line x1={9} x2={9} y1={3} y2={21} />
    <polyline points="16 9 13 12 16 15" />
  </Svg>
);

/** PanelLeftOpen icon. @since 1.0.0 */
export const PanelLeftOpen = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <line x1={9} x2={9} y1={3} y2={21} />
    <polyline points="13 9 16 12 13 15" />
  </Svg>
);

/** PanelRightClose icon. @since 1.0.0 */
export const PanelRightClose = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <line x1={15} x2={15} y1={3} y2={21} />
    <polyline points="8 9 11 12 8 15" />
  </Svg>
);

/** PanelRightOpen icon. @since 1.0.0 */
export const PanelRightOpen = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={18} rx={2} width={18} x={3} y={3} />
    <line x1={15} x2={15} y1={3} y2={21} />
    <polyline points="11 9 8 12 11 15" />
  </Svg>
);

/** Pencil icon. @since 1.0.0 */
export const Pencil = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Svg>
);

/** Pill icon. @since 1.0.0 */
export const Pill = (properties: IconProps) => (
  <Svg {...properties}>
    <rect height={9} rx={4.5} width={18} x={3} y={7.5} />
    <line x1={12} x2={12} y1={8} y2={16} />
  </Svg>
);

/** Plus icon. @since 1.0.0 */
export const Plus = (properties: IconProps) => (
  <Svg {...properties}>
    <line x1={12} x2={12} y1={5} y2={19} />
    <line x1={5} x2={19} y1={12} y2={12} />
  </Svg>
);

/** Power icon. @since 1.0.0 */
export const Power = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1={12} x2={12} y1={2} y2={12} />
  </Svg>
);

/** PowerOff icon. @since 1.0.0 */
export const PowerOff = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
    <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
    <line x1={12} x2={12} y1={2} y2={12} />
    <line x1={2} x2={22} y1={2} y2={22} />
  </Svg>
);

/** Redo2 icon. @since 1.0.0 */
export const Redo2 = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="15 14 20 9 15 4" />
    <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" />
  </Svg>
);

/** Rocket icon. @since 1.0.0 */
export const Rocket = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 8-10c1.66 0 4 1.34 4 4a22 22 0 0 1-9 9z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Svg>
);

/** RotateCcw icon. @since 1.0.0 */
export const RotateCcw = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Svg>
);

/** StickyNote icon. @since 1.0.0 */
export const StickyNote = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.5L21 14.5V5a2 2 0 0 0-2-2z" />
    <path d="M15 21v-6a1 1 0 0 1 1-1h6" />
  </Svg>
);

/** Trash2 icon. @since 1.0.0 */
export const Trash2 = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1={10} x2={10} y1={11} y2={17} />
    <line x1={14} x2={14} y1={11} y2={17} />
  </Svg>
);

/** TriangleAlert icon. @since 1.0.0 */
export const TriangleAlert = (properties: IconProps) => (
  <Svg {...properties}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1={12} x2={12} y1={9} y2={13} />
    <line x1={12} x2={12.01} y1={17} y2={17} />
  </Svg>
);

/** Undo2 icon. @since 1.0.0 */
export const Undo2 = (properties: IconProps) => (
  <Svg {...properties}>
    <polyline points="9 14 4 9 9 4" />
    <path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5A5.5 5.5 0 0 1 14.5 20H11" />
  </Svg>
);
