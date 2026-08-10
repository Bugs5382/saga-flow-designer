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
import type { Preview } from "@storybook/react";
import type { CSSProperties } from "react";

// The React Flow canvas stylesheet + the Tailwind utilities the components use.
import "@xyflow/react/dist/style.css";
// The package's own default theme tokens (the `--sfd-*` CSS variables the
// components' colours resolve to). Loaded before the utilities so the default
// palette renders exactly as shipped.
import "../src/styles/theme.css";
import "./tailwind.css";
// The alternate brand's `--sfd-*` overrides, shared with the Theming story.
import { altBrandTokens } from "../src/components/Theming.stories";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // The "Brand" toolbar global swaps the whole UI to the alternate palette
      // by overriding the `--sfd-*` variables on the wrapper — the same knob a
      // consumer turns, proving nothing but variable values change.
      const alt = context.globals.brand === "alternate";
      return (
        <div
          className="h-screen w-full bg-slate-50 text-slate-900"
          style={alt ? (altBrandTokens as CSSProperties) : undefined}
        >
          <Story />
        </div>
      );
    },
  ],
  globalTypes: {
    brand: {
      description: "Swap the --sfd-* theme variables",
      toolbar: {
        icon: "paintbrush",
        items: [
          { title: "Default theme", value: "default" },
          { title: "Alternate brand", value: "alternate" },
        ],
        title: "Brand",
      },
    },
  },
  initialGlobals: { brand: "default" },
  parameters: {
    layout: "fullscreen",
  },
  // Generate an autodocs page for every component (props tables + description).
  tags: ["autodocs"],
};

export default preview;
