# 🧩 Integrating into your app shell

saga-flow-designer ships **components, not an application**. It has no shell, no
navigation, no router, and no auth — your app owns all of that. You mount the
package's components inside **your** shell and layout, wire their callbacks to
**your** router, and inject **your** `WorkflowGateway`. This keeps the package
generic and lets it live inside any host.

## 1. Setup

```sh
npm install @bugs5382/saga-flow-designer react react-dom @xyflow/react
```

Import the token defaults and the canvas stylesheet once, at your app entry:

```ts
import "@bugs5382/saga-flow-designer/theme.css";
import "@xyflow/react/dist/style.css";
```

Add the Tailwind preset and scan the package in your Tailwind `content`:

```js
// tailwind.config.js
module.exports = {
  presets: [require("@bugs5382/saga-flow-designer/tailwind-preset")],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@bugs5382/saga-flow-designer/dist/**/*.{js,cjs}",
  ],
};
```

## 2. Provide a gateway

Implement `WorkflowGateway` against your backend (see
[USING_WITH_GO_SAGA.md](./USING_WITH_GO_SAGA.md) for a real-engine adapter, or
`createMockGateway()` to start). Create it once and pass it down:

```ts
const gateway = createGoSagaGateway("/api/workflow"); // your backend
```

## 3. Mount inside your shell + router

The four surfaces are plain components. Render them **inside your own app shell**
(header, sidebar, breadcrumbs — whatever you already have) and map their
callbacks to your router. Here with React Router, but any router works:

```tsx
import {
  FlowDesigner,
  RunsList,
  RunDetail,
  WorkflowList,
} from "@bugs5382/saga-flow-designer";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

import { AppShell } from "@/your-app/AppShell"; // YOUR shell

const WorkflowsPage = () => {
  const navigate = useNavigate();
  const [defs, setDefs] = useState<WorkflowDefinition[]>([]);
  useEffect(() => void gateway.listWorkflows().then(setDefs), []);
  return (
    <WorkflowList
      workflows={defs}
      onOpenWorkflow={(id) => navigate(`/workflows/${id}`)}
      onCreate={async () => navigate(`/workflows/${(await gateway.createWorkflow()).id}`)}
    />
  );
};

const DesignerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <FlowDesigner
      gateway={gateway}
      definitionId={id}
      onBack={() => navigate("/workflows")}
      onSave={(saved) => toast(`Saved ${saved.key}`)}
    />
  );
};

const RunPage = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  return (
    <RunDetail
      gateway={gateway}
      runId={runId!}
      onBack={() => navigate("/runs")}
      onOpenWorkflow={(id) => navigate(`/workflows/${id}`)}
    />
  );
};

// Everything renders INSIDE your shell — the package fills the content area.
export const App = () => (
  <AppShell>
    <Routes>
      <Route path="/workflows" element={<WorkflowsPage />} />
      <Route path="/workflows/:id" element={<DesignerPage />} />
      <Route path="/runs" element={<RunsPage />} />
      <Route path="/runs/:runId" element={<RunPage />} />
    </Routes>
  </AppShell>
);
```

Key points:

- **You** own the shell (`AppShell`), routing, and nav. The package components are
  route bodies. Omit any callback (`onBack`, `onOpenWorkflow`, …) and the matching
  affordance simply hides.
- **You** inject the gateway. Nothing in the package reaches a backend on its own.
- `RunDetail` subscribes to `gateway.subscribeRun` for live updates and cleans up
  on unmount — no polling.

## 4. Match your brand

The components use the package's default palette. To make them match your app,
override the `--sfd-*` CSS variables anywhere in your styles (a `:root` or a
wrapper class) — no dependency on your design system, no fork:

```css
:root {
  --sfd-coral-500: 79 70 229;   /* your primary, as "R G B" channels */
  --sfd-slate-900: 17 24 39;    /* your neutral text */
  /* … override only what you want; the rest keep the shipped defaults */
}
```

See the Storybook **Guides → Theming** page for a live brand-swap, and
`src/styles/theme.css` for the full variable list.
