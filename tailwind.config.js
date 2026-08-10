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
// Tailwind config for the demo/storybook tooling ONLY. The library itself ships
// no compiled CSS; this generates the utilities the components use when they are
// rendered in Storybook or the standalone demo.
//
// It applies the package's OWN shipped preset (`tailwind.preset.ts`), so every
// palette colour the components use — the `coral` accent plus the neutral/status
// scales (slate, teal, emerald, ...) — resolves to a `--sfd-*` CSS variable. The
// variables' default values load from `src/styles/theme.css` (imported by the
// Storybook preview and the demo entry), so the rendered result is identical to
// the pre-token palette. This mirrors exactly what a consumer does.
import sfdPreset from "./tailwind.preset";

export default {
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}", "./demo/**/*.{html,ts,tsx}"],
  plugins: [],
  presets: [sfdPreset],
};
