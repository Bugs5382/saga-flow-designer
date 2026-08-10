//#region src/config.d.ts
/**
 * The brand color mode: dark by default, and the site does not follow the OS
 * preference (the brand is dark-first). Spread into `themeConfig`.
 */
declare const colorMode: {
  readonly defaultMode: "dark";
  readonly respectPrefersColorScheme: false;
};
/**
 * The brand prism (code highlighting) config. Dark theme matches the dark-first
 * palette. Extend `additionalLanguages` with whatever a given site needs.
 */
declare const prism: {
  theme: import("prism-react-renderer").PrismTheme;
  darkTheme: import("prism-react-renderer").PrismTheme;
  additionalLanguages: string[];
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
declare const recommendedThemeConfig: {
  colorMode: {
    readonly defaultMode: "dark";
    readonly respectPrefersColorScheme: false;
  };
  docs: {
    sidebar: {
      hideable: boolean;
      autoCollapseCategories: boolean;
    };
  };
  prism: {
    theme: import("prism-react-renderer").PrismTheme;
    darkTheme: import("prism-react-renderer").PrismTheme;
    additionalLanguages: string[];
  };
};
//#endregion
export { colorMode, prism, recommendedThemeConfig };
//# sourceMappingURL=config.d.mts.map