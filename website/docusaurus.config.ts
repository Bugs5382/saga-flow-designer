import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { recommendedThemeConfig } from "@the-rabbit-hole/docs-theme/config";

// The shared brand theme owns the palette, fonts, dark-first colour mode, the
// hideable docs sidebar, and the collapsible right-side table of contents. We
// spread its recommended defaults into themeConfig, then layer this site's own
// navbar and footer on top (see below).

const GO_SAGA_DOCS = "https://bugs5382.github.io/go-saga-orchestration/";
const REPO = "https://github.com/Bugs5382/saga-flow-designer";

// Released snapshots listed in versions.json. Docs Publish cuts one with
// `docusaurus docs:version` when a release is published, right before it
// builds. Until the first one exists, the live docs are the only version and
// are served at /docs, so the landing page and footer links (/docs/intro and
// so on) resolve. Once a release is snapshotted it takes /docs and the live
// docs move to /docs/next.
const VERSIONS_FILE = path.join(__dirname, "versions.json");
const RELEASED_VERSIONS: string[] = existsSync(VERSIONS_FILE)
  ? JSON.parse(readFileSync(VERSIONS_FILE, "utf8"))
  : [];
const HAS_RELEASE = RELEASED_VERSIONS.length > 0;

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
          // The live docs are the unreleased "next" line; released snapshots
          // land in versioned_docs/ via `docusaurus docs:version`. Default to
          // the latest stable (docusaurus.config's lastVersion default). With
          // no snapshot yet, "next" is the only version and takes /docs.
          versions: {
            current: {
              label: "Next 🚧",
              path: HAS_RELEASE ? "next" : "",
              banner: "unreleased",
            },
          },
        },
        blog: false,
        theme: {
          // Brand tokens, navbar/footer borders, version banner/chip, TOC toggle.
          customCss: require.resolve(
            "@the-rabbit-hole/docs-theme/styles/custom.css",
          ),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // Contributes the collapsible right-side table of contents via @theme.
    "@the-rabbit-hole/docs-theme",
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
        // Only the public API from index.ts is documented; test files pull in
        // library-only devDeps (vitest, node:fs) absent from the docs install,
        // so exclude them and skip type-checking (the library CI type-checks).
        exclude: ["**/*.test.ts", "**/*.test.tsx"],
        skipErrorChecking: true,
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
        { type: "docsVersionDropdown", position: "right" },
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
