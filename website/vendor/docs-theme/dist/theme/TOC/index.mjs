import { useState } from "react";
import TOC from "@theme-original/TOC";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/theme/TOC/index.tsx
/**
* Wraps the right-side table of contents with a collapse toggle so the
* secondary nav can be hidden, mirroring the hideable left sidebar. The toggle
* styles (`.tocCollapsibleToggle` / `.tocChevron`) live in the brand CSS the
* consumer loads via `theme.customCss`.
*/
function TOCWrapper(props) {
	const [open, setOpen] = useState(true);
	if (!props.toc || props.toc.length === 0) return /* @__PURE__ */ jsx(TOC, { ...props });
	return /* @__PURE__ */ jsxs("div", {
		className: "tocCollapsible",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "tocCollapsibleToggle",
			"aria-expanded": open,
			onClick: () => setOpen((v) => !v),
			children: [/* @__PURE__ */ jsx("span", {
				className: open ? "tocChevron tocChevronOpen" : "tocChevron",
				"aria-hidden": "true"
			}), "On this page"]
		}), open && /* @__PURE__ */ jsx(TOC, { ...props })]
	});
}
//#endregion
export { TOCWrapper as default };

//# sourceMappingURL=index.mjs.map