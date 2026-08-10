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

import { FlowDesigner } from "../src/components/FlowDesigner";
import { createMockGateway } from "../src/mock";

// The full editor mounted against the in-memory mock gateway. Pass a
// `definitionId` and the designer loads it through the gateway, owns its
// working copy, and autosaves back to the mock store.
const gateway = createMockGateway();

const meta: Meta<typeof FlowDesigner> = {
  args: { gateway },
  component: FlowDesigner,
  parameters: { layout: "fullscreen" },
  title: "Flow Designer/FlowDesigner",
};

export default meta;

type Story = StoryObj<typeof FlowDesigner>;

export const OrderFulfillment: Story = {
  args: { definitionId: "wf-order-fulfillment" },
};

export const ApprovalFlow: Story = {
  args: { definitionId: "wf-approval-flow" },
};

export const NightlyReport: Story = {
  args: { definitionId: "wf-nightly-report" },
};
