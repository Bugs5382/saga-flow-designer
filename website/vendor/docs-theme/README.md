# @the-rabbit-hole-tech/docs-theme

> Shared Docusaurus theme for the rabbit hole docs sites.

A dark-first brand theme for [Docusaurus](https://docusaurus.io) v3: the brand
CSS tokens, a collapsible right-side table of contents, a reusable landing-page
template, and a recommended config fragment. Drop it into any rabbit hole docs
site so they all look and behave the same.

## Install

This package is published to **GitHub Packages**, not the public npm registry.
Point the `@the-rabbit-hole-tech` scope at the GitHub registry once, in the
consuming site's `.npmrc`:

```ini
@the-rabbit-hole-tech:registry=https://npm.pkg.github.com
```

Reading from GitHub Packages requires authentication even for public packages.
Use a token with the `read:packages` scope (`NODE_AUTH_TOKEN` in CI, or a line
in `~/.npmrc` locally):

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install:

```bash
npm install @the-rabbit-hole-tech/docs-theme
```

It expects Docusaurus and React as peers, which a Docusaurus site already has:

```bash
npm install @docusaurus/core @docusaurus/preset-classic react react-dom prism-react-renderer
```

## Use

### 1. Brand CSS

Add the brand stylesheet to `theme.customCss` so the tokens, navbar/footer
borders, version banner/chip, and TOC toggle styles load:

```ts
// docusaurus.config.ts
presets: [
  [
    "classic",
    {
      theme: {
        customCss: require.resolve(
          "@the-rabbit-hole-tech/docs-theme/styles/custom.css",
        ),
      },
    },
  ],
];
```

### 2. Theme plugin (collapsible TOC)

Register the plugin so the swizzled components resolve through `@theme`. Today
it contributes the collapsible right-side table of contents:

```ts
// docusaurus.config.ts
plugins: ["@the-rabbit-hole-tech/docs-theme"];
```

### 3. Recommended config fragment

Spread the brand defaults (dark color mode, hideable docs sidebar, prism with a
dark theme) into `themeConfig`, then add your site's own navbar and footer:

```ts
// docusaurus.config.ts
import { recommendedThemeConfig } from "@the-rabbit-hole-tech/docs-theme/config";

const themeConfig = {
  ...recommendedThemeConfig,
  navbar: { title: "my site", items: [] },
  footer: { style: "dark", links: [] },
};
```

The brand favicon ships with the package; reference it directly or copy it into
your site's `static/img`:

```ts
favicon: "img/favicon.svg";
```

### 4. Landing page (optional)

Build a branded home page by importing the `Landing` template into your site's
`src/pages/index.tsx` and supplying your own copy. The hero falls back to the
site `title`/`tagline` when you do not pass them:

```tsx
// src/pages/index.tsx
import Landing from "@the-rabbit-hole-tech/docs-theme/landing";

export default function Home(): JSX.Element {
  return (
    <Landing
      buttons={[
        { label: "Get started", to: "/docs", variant: "secondary" },
        { label: "GitHub", href: "https://github.com/the-rabbit-hole-tech" },
      ]}
      features={[
        { title: "Dark-first", body: "The brand palette, out of the box." },
        { title: "Consistent", body: "One theme across every docs site." },
        { title: "Idiomatic", body: "Standard Docusaurus swizzle + plugin." },
      ]}
      quickstart={{
        title: "Quickstart",
        lede: "Install and run:",
        code: "npm install\nnpm run start",
        language: "bash",
        cta: { label: "Read the docs", to: "/docs", variant: "primary" },
      }}
    />
  );
}
```

## Brand token contract

The CSS sets these Infima variables on `:root` (light) and `[data-theme="dark"]`
(the brand default). Override them in your own later-loaded CSS if a site needs
to, but stay within the palette:

| Token                            | Dark value | Meaning                     |
| -------------------------------- | ---------- | --------------------------- |
| `--ifm-background-color`         | `#222222`  | Page surface                |
| `--ifm-background-surface-color` | `#303030`  | Raised surface (cards)      |
| `--ifm-navbar-background-color`  | `#121212`  | Navbar                      |
| `--ifm-footer-background-color`  | `#0b1119`  | Footer                      |
| `--ifm-color-content`            | `#c9c9c9`  | Body text                   |
| `--ifm-heading-color`            | `#ffffff`  | Headings                    |
| `--ifm-color-primary`            | `#a8a8a8`  | Monochrome grey link/accent |
| `--ifm-color-success`            | `#84a82a`  | Success status              |
| `--ifm-color-warning`            | `#d99a2b`  | Warning status              |
| `--ifm-color-danger`             | `#c0392b`  | Error status                |

Fonts: Oswald (headings), Inter (body), JetBrains Mono (code), loaded via a
Google Fonts import at the top of the stylesheet.

### The sky-blue rule

Sky-blue `#90c1f3` is reserved for the **header component** and the docs
**unreleased/next version callout** only. It is never a general body accent — the
body accent is always monochrome grey. The version banner, version chip, and the
landing hero glow / ghost-button are the only sanctioned uses in this package.

## Develop

```bash
npm install
npm run build      # tsdown -> dist (plugin + config, esm + cjs + d.ts)
npm test           # vitest
npm run lint       # eslint + prettier
npm run typecheck  # tsc --noEmit
npm run docs       # typedoc -> docs
```

The plugin entry (`src/index.ts`) and config helper (`src/config.ts`) are
compiled to `dist`. The theme component (`src/theme/TOC`) and the landing
component (`src/components/Landing`) ship as **source** — Docusaurus compiles
them with its own `@theme` and CSS-module pipeline.

Commit discipline, AI-tell/emoji blocking, and the pre-push lint/test gate are
enforced by the governance hooks. Install them once per clone:

```bash
bash .claude/hooks/install.sh
```

## License

MIT (c) 2026 Bugs5382
