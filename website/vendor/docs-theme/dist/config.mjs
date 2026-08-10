import { themes } from "prism-react-renderer";
//#region src/config.ts
/**
* The brand color mode: dark by default, and the site does not follow the OS
* preference (the brand is dark-first). Spread into `themeConfig`.
*/
const colorMode = {
	defaultMode: "dark",
	respectPrefersColorScheme: false
};
/**
* The brand prism (code highlighting) config. Dark theme matches the dark-first
* palette. Extend `additionalLanguages` with whatever a given site needs.
*/
const prism = {
	theme: themes.github,
	darkTheme: themes.dracula,
	additionalLanguages: ["bash", "json"]
};
/**
* Recommended `themeConfig` fragment carrying the brand defaults (dark color
* mode, a hideable/auto-collapsing docs sidebar, and the brand prism config).
* Spread it into a site's `themeConfig` and layer site-specific `navbar` /
* `footer` on top.
*
* @example
* ```ts
* import { recommendedThemeConfig } from "@the-rabbit-hole-tech/docs-theme/config";
*
* const themeConfig = {
*   ...recommendedThemeConfig,
*   navbar: { title: "my site", items: [] },
*   footer: { style: "dark", links: [] },
* };
* ```
*/
const recommendedThemeConfig = {
	colorMode,
	docs: { sidebar: {
		hideable: true,
		autoCollapseCategories: true
	} },
	prism
};
//#endregion
export { colorMode, prism, recommendedThemeConfig };

//# sourceMappingURL=config.mjs.map