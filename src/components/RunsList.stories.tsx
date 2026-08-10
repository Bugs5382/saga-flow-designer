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

import type { WorkflowDefinition } from "../workflowData";

import { exampleRuns, exampleWorkflows } from "../mock";
import { RunsList } from "./RunsList";

// The global execution-history table, fed directly from the example seed. The
// mixed statuses (succeeded / running / paused / failed) show off the status
// column, and `workflowsById` resolves the per-row workflow labels.
const workflowsById: Record<string, WorkflowDefinition> = Object.fromEntries(
  exampleWorkflows.map((workflow) => [workflow.id, workflow]),
);

const noop = (): undefined => undefined;

const meta: Meta<typeof RunsList> = {
  args: { onOpenRun: noop, onOpenWorkflow: noop, runs: exampleRuns, workflowsById },
  component: RunsList,
  title: "Flow Designer/RunsList",
};

export default meta;

type Story = StoryObj<typeof RunsList>;

export const AllRuns: Story = {};

export const Empty: Story = {
  args: { runs: [] },
};
