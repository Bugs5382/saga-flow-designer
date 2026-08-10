import { ReactNode } from "react";

//#region src/components/Landing/index.d.ts
/** A call-to-action button rendered in the hero. */
interface LandingButton {
  /** Visible label. */
  label: string;
  /** Internal route (resolved through the router). */
  to?: string;
  /** External URL (rendered as a plain anchor). */
  href?: string;
  /**
   * Visual treatment. `primary` is the filled monochrome button, `secondary`
   * the lighter fill, and `ghost` the sky-blue outline that reads on the hero.
   * Defaults to `ghost`.
   */
  variant?: "primary" | "secondary" | "ghost";
}
/** One feature card in the feature grid. */
interface LandingFeature {
  /** Card heading. */
  title: string;
  /** Card body copy. */
  body: ReactNode;
  /**
   * Optional decorative glyph or element shown above the title (for example an
   * imported SVG or an emoji string supplied by the consuming site).
   */
  icon?: ReactNode;
}
/** An optional code sample rendered in the quickstart section. */
interface LandingQuickstart {
  /** Section heading. Defaults to "Quickstart". */
  title?: string;
  /** Short lede shown under the heading. */
  lede?: ReactNode;
  /** The code to display. */
  code: string;
  /** Prism language id (must be enabled in the site's prism config). */
  language?: string;
  /** Optional filename shown on the code block. */
  fileName?: string;
  /** Optional button shown below the code block. */
  cta?: LandingButton;
}
/** Props for the {@link Landing} page template. */
interface LandingProps {
  /** Hero headline. Defaults to the site `title`. */
  title?: string;
  /** Hero subhead. Defaults to the site `tagline`. */
  tagline?: ReactNode;
  /** Hero call-to-action buttons. */
  buttons?: LandingButton[];
  /** Feature cards laid out in a three-column grid. */
  features?: LandingFeature[];
  /** Optional quickstart code section. */
  quickstart?: LandingQuickstart;
  /** Layout `<head>` title. Defaults to "Home". */
  pageTitle?: string;
  /** Layout meta description. Defaults to the site `tagline`. */
  description?: string;
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
declare function Landing(props: LandingProps): ReactNode;
//#endregion
export { LandingButton, LandingFeature, LandingProps, LandingQuickstart, Landing as default };
//# sourceMappingURL=index.d.mts.map