/*
MIT License

Copyright (c) 2026 Shane

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
import { type ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import CodeBlock from "@theme/CodeBlock";

/** A call-to-action button rendered in the hero. */
export interface LandingButton {
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
export interface LandingFeature {
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
export interface LandingQuickstart {
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
export interface LandingProps {
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

const VARIANT_CLASS: Record<NonNullable<LandingButton["variant"]>, string> = {
  primary: "button button--primary button--lg",
  secondary: "button button--secondary button--lg",
  ghost: "button button--lg rhl-ghost-button",
};

function CtaButton({ button }: { button: LandingButton }): ReactNode {
  const className = VARIANT_CLASS[button.variant ?? "ghost"];
  if (button.href) {
    return (
      <Link className={className} href={button.href}>
        {button.label}
      </Link>
    );
  }
  return (
    <Link className={className} to={button.to ?? "/"}>
      {button.label}
    </Link>
  );
}

function Hero({
  title,
  tagline,
  buttons,
}: Pick<LandingProps, "title" | "tagline" | "buttons">): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={"rhl-hero"}>
      <div className="container">
        <Heading as="h1" className={"rhl-hero-title"}>
          {title ?? siteConfig.title}
        </Heading>
        <p className={"rhl-hero-tagline"}>{tagline ?? siteConfig.tagline}</p>
        {buttons && buttons.length > 0 && (
          <div className={"rhl-hero-buttons"}>
            {buttons.map((b) => (
              <CtaButton key={b.label} button={b} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function Features({ features }: { features: LandingFeature[] }): ReactNode {
  return (
    <section className={"rhl-features"}>
      <div className="container">
        <div className="row">
          {features.map((f, i) => (
            <div className="col col--4" key={typeof f.title === "string" ? f.title : i}>
              <div className={"rhl-card"}>
                {f.icon != null && (
                  <div className={"rhl-card-icon"} aria-hidden="true">
                    {f.icon}
                  </div>
                )}
                <Heading as="h3" className={"rhl-card-title"}>
                  {f.title}
                </Heading>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Quickstart({ quickstart }: { quickstart: LandingQuickstart }): ReactNode {
  return (
    <section className={"rhl-quickstart"}>
      <div className="container">
        <Heading as="h2" className={"rhl-section-title"}>
          {quickstart.title ?? "Quickstart"}
        </Heading>
        {quickstart.lede != null && <p className={"rhl-section-lede"}>{quickstart.lede}</p>}
        <div className={"rhl-quickstart-code"}>
          <CodeBlock language={quickstart.language ?? "bash"} title={quickstart.fileName}>
            {quickstart.code}
          </CodeBlock>
        </div>
        {quickstart.cta && (
          <div className={"rhl-quickstart-link"}>
            <CtaButton button={quickstart.cta} />
          </div>
        )}
      </div>
    </section>
  );
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
export default function Landing(props: LandingProps): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const { title, tagline, buttons, features, quickstart, pageTitle = "Home", description } = props;

  return (
    <Layout title={pageTitle} description={description ?? (siteConfig.tagline as string)}>
      <Hero title={title} tagline={tagline} buttons={buttons} />
      <main>
        {features && features.length > 0 && <Features features={features} />}
        {quickstart && <Quickstart quickstart={quickstart} />}
      </main>
    </Layout>
  );
}
