import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import CodeBlock from "@theme/CodeBlock";
import styles from "./index.module.css";

const REPO = "https://github.com/Bugs5382/saga-flow-designer";

const quickstartCode = `import { FlowDesigner, createMockGateway } from "@bugs5382/saga-flow-designer";
import "@bugs5382/saga-flow-designer/theme.css";
import "@xyflow/react/dist/style.css";

// createMockGateway() seeds an in-memory WorkflowGateway — no backend needed.
const gateway = createMockGateway();

export const Designer = () => (
  <FlowDesigner gateway={gateway} definitionId="wf-order-fulfillment" />
);
`;

const features: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎨",
    title: "Visual flow canvas",
    body: "A React Flow (@xyflow/react) canvas for authoring stages, branches, and lanes as a workflow definition.",
  },
  {
    icon: "🧩",
    title: "Catalog-driven palette",
    body: "The verb palette, canvas, and config panel all render from one verb catalog — no hand-wired node types.",
  },
  {
    icon: "🔌",
    title: "Pluggable gateway",
    body: "The UI talks to exactly one WorkflowGateway port — swap the in-memory mock for a real go-saga adapter behind a single seam.",
  },
  {
    icon: "🧭",
    title: "3-pane chrome",
    body: "Palette, canvas, and inspector, with collapsible side panels, undo/redo, copy/paste, and debounced autosave built in.",
  },
  {
    icon: "🧱",
    title: "Extensible catalog",
    body: "Register vendor verbs into the palette alongside the built-ins — no fork of the canvas required.",
  },
  {
    icon: "🧪",
    title: "Storybook + mock-first",
    body: "Every primitive ships as a story, and createMockGateway() runs the whole designer with zero backend.",
  },
];

function Hero(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroTagline}>{siteConfig.tagline}</p>
        <div className={styles.heroButtons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get started →
          </Link>
          {/* No slug maps a doc to the bare /docs route here (unlike go-saga's
              intro.md), so "Documentation" points at the same first doc the
              navbar's docSidebar item resolves to. */}
          <Link className={`button button--lg ${styles.ghostButton}`} to="/docs/intro">
            Documentation
          </Link>
          <Link className={`button button--lg ${styles.ghostButton}`} href={REPO}>
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((f) => (
            <div className="col col--4" key={f.title}>
              <div className={styles.card}>
                <div className={styles.cardIcon} aria-hidden="true">
                  {f.icon}
                </div>
                <Heading as="h3" className={styles.cardTitle}>
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

function Quickstart(): ReactNode {
  return (
    <section className={styles.quickstart}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Quickstart
        </Heading>
        <p className={styles.sectionLede}>
          Mount the designer against the in-memory mock gateway — no backend required:
        </p>
        <div className={styles.quickstartCode}>
          <CodeBlock language="tsx" title="Designer.tsx">
            {quickstartCode}
          </CodeBlock>
        </div>
        <div className={styles.quickstartLink}>
          <Link className="button button--primary button--lg" to="/docs/integration">
            Integration guide →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline as string}>
      <Hero />
      <main>
        <Features />
        <Quickstart />
      </main>
    </Layout>
  );
}
