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
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone demo app: mounts the FlowDesigner full-screen against the in-memory
// mock gateway, with no host and no backend. Tailwind + PostCSS are picked up
// from the repo-root configs. Run with `npm run demo`.
export default defineConfig({
  build: { outDir: "dist" },
  plugins: [react()],
  root: "examples",
  // When running against a real go-saga engine (VITE_GS_BASE=/gs), proxy /gs to
  // the engine's cmd/api so the browser calls stay same-origin (no CORS). Point
  // at a different engine with VITE_GS_TARGET.
  server: {
    proxy: {
      "/gs": {
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/gs/u, ""),
        target: process.env.VITE_GS_TARGET ?? "http://localhost:18100",
      },
    },
  },
});
