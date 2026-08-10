import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// The hand-written guides are listed explicitly so their order is intentional.
// The API category is fed by the sidebar file that docusaurus-plugin-typedoc
// writes into the (gitignored) generated docs/api folder on every build.
const sidebars: SidebarsConfig = {
  docs: [
    "intro",
    "gateway",
    "model",
    "integration",
    "go-saga",
    {
      type: "category",
      label: "API",
      link: { type: "doc", id: "api/index" },
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      items: require("./docs/api/typedoc-sidebar.cjs"),
    },
  ],
};

export default sidebars;
