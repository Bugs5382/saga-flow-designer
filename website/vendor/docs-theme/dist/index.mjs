import path from "path";
import { fileURLToPath } from "url";
//#region src/index.ts
/**
* Resolve this module's directory. tsdown emits both ESM and CJS; it rewrites
* `import.meta.url` to the equivalent in the CJS bundle, so this works in both.
*/
function moduleDir() {
	return path.dirname(fileURLToPath(import.meta.url));
}
/**
* Docusaurus theme plugin for the rabbit hole docs sites.
*
* It contributes the swizzleable theme components (the collapsible right-side
* table of contents) so they resolve through `@theme`. Add it to the `plugins`
* array in a site's `docusaurus.config.ts`. The brand CSS and the landing
* component are consumed separately — see the package README.
*
* @example
* ```ts
* import type { Config } from "@docusaurus/types";
*
* const config: Config = {
*   plugins: ["@the-rabbit-hole-tech/docs-theme"],
*   presets: [
*     [
*       "classic",
*       {
*         theme: {
*           customCss: require.resolve(
*             "@the-rabbit-hole-tech/docs-theme/styles/custom.css",
*           ),
*         },
*       },
*     ],
*   ],
* };
* ```
*/
function docsTheme(_context, _options) {
	return {
		name: "@the-rabbit-hole-tech/docs-theme",
		getThemePath() {
			return path.join(moduleDir(), "theme");
		},
		getTypeScriptThemePath() {
			return path.join(moduleDir(), "..", "src", "theme");
		}
	};
}
//#endregion
export { docsTheme as default };

//# sourceMappingURL=index.mjs.map