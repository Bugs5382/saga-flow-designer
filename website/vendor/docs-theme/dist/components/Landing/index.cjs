const require_rolldown_runtime = require("../../rolldown-runtime-D6vf50IK.cjs");
require("react");
let react_jsx_runtime = require("react/jsx-runtime");
let _docusaurus_Link = require("@docusaurus/Link");
_docusaurus_Link = require_rolldown_runtime.__toESM(_docusaurus_Link, 1);
let _docusaurus_useDocusaurusContext = require("@docusaurus/useDocusaurusContext");
_docusaurus_useDocusaurusContext = require_rolldown_runtime.__toESM(_docusaurus_useDocusaurusContext, 1);
let _theme_Layout = require("@theme/Layout");
_theme_Layout = require_rolldown_runtime.__toESM(_theme_Layout, 1);
let _theme_Heading = require("@theme/Heading");
_theme_Heading = require_rolldown_runtime.__toESM(_theme_Heading, 1);
let _theme_CodeBlock = require("@theme/CodeBlock");
_theme_CodeBlock = require_rolldown_runtime.__toESM(_theme_CodeBlock, 1);
//#region src/components/Landing/index.tsx
const VARIANT_CLASS = {
	primary: "button button--primary button--lg",
	secondary: "button button--secondary button--lg",
	ghost: "button button--lg rhl-ghost-button"
};
function CtaButton({ button }) {
	const className = VARIANT_CLASS[button.variant ?? "ghost"];
	if (button.href) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_docusaurus_Link.default, {
		className,
		href: button.href,
		children: button.label
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_docusaurus_Link.default, {
		className,
		to: button.to ?? "/",
		children: button.label
	});
}
function Hero({ title, tagline, buttons }) {
	const { siteConfig } = (0, _docusaurus_useDocusaurusContext.default)();
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
		className: "rhl-hero",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "container",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_Heading.default, {
					as: "h1",
					className: "rhl-hero-title",
					children: title ?? siteConfig.title
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "rhl-hero-tagline",
					children: tagline ?? siteConfig.tagline
				}),
				buttons && buttons.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "rhl-hero-buttons",
					children: buttons.map((b) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CtaButton, { button: b }, b.label))
				})
			]
		})
	});
}
function Features({ features }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
		className: "rhl-features",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "container",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "row",
				children: features.map((f, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "col col--4",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "rhl-card",
						children: [
							f.icon != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "rhl-card-icon",
								"aria-hidden": "true",
								children: f.icon
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_Heading.default, {
								as: "h3",
								className: "rhl-card-title",
								children: f.title
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: f.body })
						]
					})
				}, typeof f.title === "string" ? f.title : i))
			})
		})
	});
}
function Quickstart({ quickstart }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
		className: "rhl-quickstart",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "container",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_Heading.default, {
					as: "h2",
					className: "rhl-section-title",
					children: quickstart.title ?? "Quickstart"
				}),
				quickstart.lede != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "rhl-section-lede",
					children: quickstart.lede
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "rhl-quickstart-code",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_theme_CodeBlock.default, {
						language: quickstart.language ?? "bash",
						title: quickstart.fileName,
						children: quickstart.code
					})
				}),
				quickstart.cta && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "rhl-quickstart-link",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CtaButton, { button: quickstart.cta })
				})
			]
		})
	});
}
/**
* Reusable landing page template carrying the rabbit hole brand layout: a
* centered hero, a three-column feature grid, and an optional quickstart code
* section. Drop it into a site's `src/pages/index.tsx` and supply the copy.
*
* @example
* ```tsx
* import Landing from "@the-rabbit-hole-tech/docs-theme/landing";
*
* export default function Home(): JSX.Element {
*   return (
*     <Landing
*       buttons={[
*         { label: "Get started", to: "/docs/getting-started", variant: "secondary" },
*         { label: "GitHub", href: "https://github.com/the-rabbit-hole-tech" },
*       ]}
*       features={[
*         { title: "Fast", body: "Ships nothing you do not need." },
*       ]}
*       quickstart={{ code: "npm install", language: "bash" }}
*     />
*   );
* }
* ```
*/
function Landing(props) {
	const { siteConfig } = (0, _docusaurus_useDocusaurusContext.default)();
	const { title, tagline, buttons, features, quickstart, pageTitle = "Home", description } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_theme_Layout.default, {
		title: pageTitle,
		description: description ?? siteConfig.tagline,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hero, {
			title,
			tagline,
			buttons
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", { children: [features && features.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Features, { features }), quickstart && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Quickstart, { quickstart })] })]
	});
}
//#endregion
module.exports = Landing;

//# sourceMappingURL=index.cjs.map