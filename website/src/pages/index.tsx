import React, { type ReactNode } from "react";

import Landing from "@the-rabbit-hole-tech/docs-theme/landing";

// The branded landing template ships with the shared theme; we supply this
// site's own copy. The hero falls back to the site title/tagline.
export default function Home(): ReactNode {
  return (
    <Landing
      buttons={[
        { label: "Get started", to: "/docs/intro", variant: "secondary" },
        { label: "GitHub", href: "https://github.com/Bugs5382/saga-flow-designer" },
      ]}
      features={[
        {
          title: "Engine-agnostic core",
          body: "Pure TypeScript domain model, gateway seam, mapper, and validation. No React, no transport.",
        },
        {
          title: "One gateway seam",
          body: "The host implements a single port; the same UI runs against any adapter, in-process or remote.",
        },
        {
          title: "Lossless mapper",
          body: "Flatten and expand round-trip between the engine-flat DAG and the UI-nested stage tree.",
        },
      ]}
      quickstart={{
        title: "Quickstart",
        lede: "Install the library and its peers:",
        code: "npm install @bugs5382/saga-flow-designer\nnpm install react react-dom @xyflow/react",
        language: "bash",
        cta: { label: "Read the docs", to: "/docs/intro", variant: "primary" },
      }}
    />
  );
}
