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

import { createMockGateway } from "../mock";
import { RunDetail } from "./RunDetail";

// A single run with the status overlay on the canvas, the step timeline, and
// the event log. RunDetail subscribes to the gateway's run stream; the mock
// replays the seeded run frame-by-frame, so the timeline and overlay fill in
// live rather than snapping straight to the final result.
const gateway = createMockGateway();

const meta: Meta<typeof RunDetail> = {
  args: { gateway },
  component: RunDetail,
  parameters: { layout: "fullscreen" },
  title: "Flow Designer/RunDetail",
};

export default meta;

type Story = StoryObj<typeof RunDetail>;

export const Succeeded: Story = {
  args: { runId: "run-order-shipped-4821" },
};

export const Paused: Story = {
  args: { runId: "run-approval-paused-118" },
};

export const Failed: Story = {
  args: { runId: "run-report-failed-0705" },
};
