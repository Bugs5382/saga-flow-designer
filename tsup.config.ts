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
import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  // The library entry plus the Tailwind preset. Building the preset here emits
  // both ESM (`dist/tailwind.preset.js`) and CJS (`dist/tailwind.preset.cjs`)
  // plus its types, so consumers can `require("@bugs5382/saga-flow-designer/
  // tailwind-preset")` from a CommonJS Tailwind config. The object form pins the
  // output basenames so both land flat in `dist/` (a plain array would nest
  // `index` under `dist/src/` once a root-level entry joins it).
  entry: { index: "src/index.ts", "tailwind.preset": "tailwind.preset.ts" },
  // Keep peer deps external (never bundle them); the trailing regex also keeps
  // subpath imports external — notably `@xyflow/react/dist/style.css`, so the
  // consumer's bundler resolves and includes the canvas stylesheet.
  external: ["react", "react-dom", "@xyflow/react", /^@xyflow\/react\//],
  format: ["esm", "cjs"],
  // The default theme tokens are plain CSS (not an importable module), so copy
  // them verbatim into `dist` after a successful build. They ship as
  // `@bugs5382/saga-flow-designer/theme.css`.
  onSuccess: async () => {
    copyFileSync("src/styles/theme.css", "dist/theme.css");
  },
  sourcemap: true,
  treeshake: true,
});
