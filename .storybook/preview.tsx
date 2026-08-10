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

// The React Flow canvas stylesheet + the Tailwind utilities the components use.
import "@xyflow/react/dist/style.css";
import "./tailwind.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-slate-50 text-slate-900">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  // Generate an autodocs page for every component (props tables + description).
  tags: ["autodocs"],
};

export default preview;
