import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

import { recommendedThemeConfig } from "@the-rabbit-hole-tech/docs-theme/config";

// The shared brand theme owns the palette, fonts, dark-first colour mode, the
// hideable docs sidebar, and the collapsible right-side table of contents. We
// spread its recommended defaults into themeConfig, then layer this site's own
// navbar and footer on top (see below).

const GO_SAGA_DOCS = "https://bugs5382.github.io/go-saga-orchestration/";
const REPO = "https://github.com/Bugs5382/saga-flow-designer";

const config: Config = {
  title: "saga-flow-designer",
  tagline:
    "React components + utilities for visualising and editing saga-orchestration workflows and runs",
  favicon: "img/favicon.svg",

  url: "https://bugs5382.github.io",
  baseUrl: "/saga-flow-designer/",

  organizationName: "Bugs5382",
  projectName: "saga-flow-designer",

  onBrokenLinks: "throw",

  // Parse .md as CommonMark (only .mdx is treated as MDX). The generated API
  // reference and the guides both contain angle-bracket placeholders like
  // record.<field>, which MDX would try to parse as JSX tags.
  markdown: {
    format: "detect",
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl: `${REPO}/tree/main/website/`,
        },
        blog: false,
        theme: {
          // Brand tokens, navbar/footer borders, version banner/chip, TOC toggle.
          customCss: require.resolve(
            "@the-rabbit-hole-tech/docs-theme/styles/custom.css",
          ),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Contributes the collapsible right-side table of contents via @theme.
    "@the-rabbit-hole-tech/docs-theme",
    // Generates the API reference from the library's public surface. The entry
    // point is the package barrel; the "Since" sections come from the @since
    // tags on the exported symbols. Output lands in docs/api (gitignored) and
    // is regenerated on every build.
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",
        out: "docs/api",
        readme: "none",
        // Escape raw tags / brace syntax in doc-comments so the generated
        // Markdown is MDX-safe (e.g. record.<field>, {name, value}).
        sanitizeComments: true,
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
      },
    ],
  ],

  themeConfig: {
    ...recommendedThemeConfig,
    navbar: {
      title: "saga-flow-designer",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        // Cross-link to the sibling engine docs site.
        { href: GO_SAGA_DOCS, label: "go-saga", position: "left" },
        { href: REPO, label: "GitHub", position: "right" },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Introduction", to: "/docs/intro" },
            { label: "The gateway seam", to: "/docs/gateway" },
            { label: "Data model", to: "/docs/model" },
          ],
        },
        {
          title: "More",
          items: [
            { label: "go-saga", href: GO_SAGA_DOCS },
            { label: "GitHub", href: REPO },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} saga-flow-designer. Built with Docusaurus.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
