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

/**
 * Tailwind preset that maps every palette colour the components use onto the
 * package's `--sfd-*` CSS variables, in channel form so Tailwind's opacity
 * modifiers keep working (`bg-slate-700/50`, `text-coral-600`, ...).
 *
 * The variables' default values ship in `@bugs5382/saga-flow-designer/theme.css`
 * and equal the components' original palette, so adding this preset alone causes
 * no visual change. A host restyles by overriding the `--sfd-*` variables — the
 * package carries its own defaults and depends on no external design system.
 *
 * Consume it from your Tailwind config:
 *
 * ```js
 * // tailwind.config.js
 * module.exports = {
 *   presets: [require("@bugs5382/saga-flow-designer/tailwind-preset")],
 *   content: [
 *     "./src/**\/*.{ts,tsx}",
 *     "./node_modules/@bugs5382/saga-flow-designer/dist/**\/*.{js,cjs}",
 *   ],
 * };
 * ```
 *
 * @since 1.0.0
 */

/** A Tailwind colour scale: shade key -> CSS colour expression. */
type ColorScale = Record<string, string>;

/** The subset of the Tailwind config shape this preset contributes. */
interface TailwindPreset {
  theme: {
    extend: {
      colors: Record<string, ColorScale>;
    };
  };
}

/**
 * Build a colour scale whose every shade resolves to the matching `--sfd-*`
 * variable, wrapped so Tailwind can apply opacity modifiers.
 */
const scale = (name: string, shades: readonly number[]): ColorScale =>
  Object.fromEntries(
    shades.map((shade) => [shade, `rgb(var(--sfd-${name}-${shade}) / <alpha-value>)`]),
  );

/**
 * The preset. Only the shades the components actually use are mapped; every
 * other Tailwind default is left untouched via `theme.extend`.
 *
 * @since 1.0.0
 */
const preset: TailwindPreset = {
  theme: {
    extend: {
      colors: {
        amber: scale("amber", [50, 100, 200, 300, 400, 500, 600, 700, 800]),
        coral: scale("coral", [50, 100, 200, 300, 400, 500, 600, 700]),
        emerald: scale("emerald", [50, 100, 200, 300, 400, 500, 600, 700]),
        indigo: scale("indigo", [50, 200, 300, 400, 500, 600, 700]),
        rose: scale("rose", [50, 100, 200, 300, 400, 500, 600, 700]),
        sky: scale("sky", [100, 300, 500, 600, 700]),
        slate: scale("slate", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        teal: scale("teal", [50, 100, 200, 300, 400, 500, 600, 700, 800]),
        zinc: scale("zinc", [100, 200, 300, 400, 500]),
      },
    },
  },
};

export default preset;
