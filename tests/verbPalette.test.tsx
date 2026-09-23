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
// Palette display behaviours, exercised through the REAL FlowDesigner so they
// cover the wiring: a group whose verbs are all hidden shows no header, and the
// 3rd-party tab can be turned off by a host that ships only its own catalog.
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { FlowDesigner } from "../src/components/FlowDesigner";
import { createMockGateway, exampleWorkflows } from "../src/mock";

// @xyflow/react's canvas needs ResizeObserver to mount; a no-op is enough here.
beforeAll(() => {
  class ResizeObserverStub {
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
});

describe("VerbPalette display", () => {
  afterEach(cleanup);

  it("hides a group header when all its verbs are hidden", () => {
    render(
      <FlowDesigner
        catalogOverrides={{ hide: ["wait_duration", "wait_until"] }}
        definition={exampleWorkflows[0]}
        gateway={createMockGateway()}
      />,
    );
    // The Waits group had only those two verbs, so its header is gone.
    expect(screen.queryByText("Waits")).toBeNull();
    // A group that still has verbs keeps its header.
    expect(screen.getByText("Control")).toBeTruthy();
  });

  it("shows the 3rd-party tab by default", () => {
    render(<FlowDesigner definition={exampleWorkflows[0]} gateway={createMockGateway()} />);
    expect(screen.getByText("3rd-party")).toBeTruthy();
  });

  it("hides the 3rd-party tab when showThirdParty is false", () => {
    render(
      <FlowDesigner
        definition={exampleWorkflows[0]}
        gateway={createMockGateway()}
        showThirdParty={false}
      />,
    );
    expect(screen.queryByText("3rd-party")).toBeNull();
    // The base catalog still renders without the tabs.
    expect(screen.getByText("Control")).toBeTruthy();
  });
});
