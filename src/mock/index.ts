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
 * In-memory mock data source. A fully self-contained {@link WorkflowGateway}
 * implementation plus the generic example workflows and runs it is seeded from,
 * so the designer surfaces run standalone with no host and no backend — the
 * face of the demo harness and the Storybook / demo-app data source.
 *
 * @since 1.0.0
 */
export { exampleRuns } from "./exampleRuns";
export { exampleSystemDefault, exampleWorkflows } from "./exampleWorkflows";
export { createMockGateway, MockWorkflowGateway } from "./gateway";
