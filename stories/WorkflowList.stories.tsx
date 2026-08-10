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
import type { Meta, StoryObj } from "@storybook/react";

import { WorkflowList } from "../src/components/WorkflowList";
import { exampleWorkflows } from "../src/mock";

// The definitions table with its per-row lifecycle menu. Wiring the lifecycle
// callbacks (create / delete / restore / enable) surfaces the full menu; the
// example seed mixes published and draft, system and user flows.
const noop = (): undefined => undefined;

const meta: Meta<typeof WorkflowList> = {
  args: {
    onCreate: noop,
    onDelete: noop,
    onOpenWorkflow: noop,
    onRestore: noop,
    onToggleEnabled: noop,
    workflows: exampleWorkflows,
  },
  component: WorkflowList,
  title: "Flow Designer/WorkflowList",
};

export default meta;

type Story = StoryObj<typeof WorkflowList>;

export const AllWorkflows: Story = {};

export const Empty: Story = {
  args: { workflows: [] },
};
