/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// The React Flow canvas stylesheet + the Tailwind utilities the components use.
import "@xyflow/react/dist/style.css";

// The package's own default theme tokens (the `--sfd-*` CSS variables).
import "../src/styles/theme.css";
import "./index.css";
import { createMockGateway, FlowDesigner } from "../src";
import { createHttpGateway } from "./httpGateway";

// Two ways to run the same designer:
//   - default: the in-memory mock gateway (no backend).
//   - VITE_GS_BASE set: a real go-saga engine over HTTP (proxied at that base).
const environment = (import.meta as unknown as { env?: Record<string, string> }).env;
const gsBase = environment?.VITE_GS_BASE;
const gateway = gsBase ? createHttpGateway(gsBase) : createMockGateway();
const definitionId = gsBase
  ? (environment?.VITE_GS_DEF ?? "order.fulfillment")
  : "wf-order-fulfillment";

const container = document.querySelector("#root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <div className="h-screen w-screen bg-slate-50 text-slate-900">
        <FlowDesigner definitionId={definitionId} gateway={gateway} />
      </div>
    </StrictMode>,
  );
}
