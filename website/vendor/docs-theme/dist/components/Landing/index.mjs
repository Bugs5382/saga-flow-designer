import "react";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import CodeBlock from "@theme/CodeBlock";
//#region src/components/Landing/index.tsx
const VARIANT_CLASS = {
	primary: "button button--primary button--lg",
	secondary: "button button--secondary button--lg",
	ghost: "button button--lg rhl-ghost-button"
};
function CtaButton({ button }) {
	const className = VARIANT_CLASS[button.variant ?? "ghost"];
	if (button.href) return /* @__PURE__ */ jsx(Link, {
		className,
		href: button.href,
		children: button.label
	});
	return /* @__PURE__ */ jsx(Link, {
		className,
		to: button.to ?? "/",
		children: button.label
	});
}
function Hero({ title, tagline, buttons }) {
	const { siteConfig } = useDocusaurusContext();
	return /* @__PURE__ */ jsx("header", {
		className: "rhl-hero",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container",
			children: [
				/* @__PURE__ */ jsx(Heading, {
					as: "h1",
					className: "rhl-hero-title",
					children: title ?? siteConfig.title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "rhl-hero-tagline",
					children: tagline ?? siteConfig.tagline
				}),
				buttons && buttons.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "rhl-hero-buttons",
					children: buttons.map((b) => /* @__PURE__ */ jsx(CtaButton, { button: b }, b.label))
				})
			]
		})
	});
}
function Features({ features }) {
	return /* @__PURE__ */ jsx("section", {
		className: "rhl-features",
		children: /* @__PURE__ */ jsx("div", {
			className: "container",
			children: /* @__PURE__ */ jsx("div", {
				className: "row",
				children: features.map((f, i) => /* @__PURE__ */ jsx("div", {
					className: "col col--4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "rhl-card",
						children: [
							f.icon != null && /* @__PURE__ */ jsx("div", {
								className: "rhl-card-icon",
								"aria-hidden": "true",
								children: f.icon
							}),
							/* @__PURE__ */ jsx(Heading, {
								as: "h3",
								className: "rhl-card-title",
								children: f.title
							}),
							/* @__PURE__ */ jsx("p", { children: f.body })
						]
					})
				}, typeof f.title === "string" ? f.title : i))
			})
		})
	});
}
function Quickstart({ quickstart }) {
	return /* @__PURE__ */ jsx("section", {
		className: "rhl-quickstart",
		children: /* @__PURE__ */ jsxs("div", {
			className: "container",
			children: [
				/* @__PURE__ */ jsx(Heading, {
					as: "h2",
					className: "rhl-section-title",
					children: quickstart.title ?? "Quickstart"
				}),
				quickstart.lede != null && /* @__PURE__ */ jsx("p", {
					className: "rhl-section-lede",
					children: quickstart.lede
				}),
				/* @__PURE__ */ jsx("div", {
					className: "rhl-quickstart-code",
					children: /* @__PURE__ */ jsx(CodeBlock, {
						language: quickstart.language ?? "bash",
						title: quickstart.fileName,
						children: quickstart.code
					})
				}),
				quickstart.cta && /* @__PURE__ */ jsx("div", {
					className: "rhl-quickstart-link",
					children: /* @__PURE__ */ jsx(CtaButton, { button: quickstart.cta })
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
	const { siteConfig } = useDocusaurusContext();
	const { title, tagline, buttons, features, quickstart, pageTitle = "Home", description } = props;
	return /* @__PURE__ */ jsxs(Layout, {
		title: pageTitle,
		description: description ?? siteConfig.tagline,
		children: [/* @__PURE__ */ jsx(Hero, {
			title,
			tagline,
			buttons
		}), /* @__PURE__ */ jsxs("main", { children: [features && features.length > 0 && /* @__PURE__ */ jsx(Features, { features }), quickstart && /* @__PURE__ */ jsx(Quickstart, { quickstart })] })]
	});
}
//#endregion
export { Landing as default };

//# sourceMappingURL=index.mjs.map