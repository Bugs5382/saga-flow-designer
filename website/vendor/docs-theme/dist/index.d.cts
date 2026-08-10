import { LoadContext, Plugin } from "@docusaurus/types";

//#region src/index.d.ts
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
declare function docsTheme(_context: LoadContext, _options: unknown): Plugin<undefined>;
export = docsTheme;
//# sourceMappingURL=index.d.cts.map