import React from "react";
import { WrapperProps } from "@docusaurus/types";
import TOCType from "@theme/TOC";

//#region src/theme/TOC/index.d.ts
type Props = WrapperProps<typeof TOCType>;
/**
 * Wraps the right-side table of contents with a collapse toggle so the
 * secondary nav can be hidden, mirroring the hideable left sidebar. The toggle
 * styles (`.tocCollapsibleToggle` / `.tocChevron`) live in the brand CSS the
 * consumer loads via `theme.customCss`.
 */
declare function TOCWrapper(props: Props): React.JSX.Element;
export = TOCWrapper;
//# sourceMappingURL=index.d.cts.map