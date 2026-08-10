const require_rolldown_runtime = require("../../rolldown-runtime-D6vf50IK.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _theme_original_TOC = require("@theme-original/TOC");
_theme_original_TOC = require_rolldown_runtime.__toESM(_theme_original_TOC, 1);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/theme/TOC/index.tsx
/**
* Wraps the right-side table of contents with a collapse toggle so the
* secondary nav can be hidden, mirroring the hideable left sidebar. The toggle
* styles (`.tocCollapsibleToggle` / `.tocChevron`) live in the brand CSS the
* consumer loads via `theme.customCss`.
*/
function TOCWrapper(props) {
	const [open, setOpen] = (0, react.useState)(true);
	if (!props.toc || props.toc.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_original_TOC.default, { ...props });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "tocCollapsible",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "tocCollapsibleToggle",
			"aria-expanded": open,
			onClick: () => setOpen((v) => !v),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: open ? "tocChevron tocChevronOpen" : "tocChevron",
				"aria-hidden": "true"
			}), "On this page"]
		}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_original_TOC.default, { ...props })]
	});
}
//#endregion
module.exports = TOCWrapper;

//# sourceMappingURL=index.cjs.map