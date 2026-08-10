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
 * Package entry / public API surface.
 *
 * The dependency-free logic core of the Flow Designer: the workflow + run
 * domain model and verb catalog, the gateway seam interface, the flatten/expand
 * engine mapper, the live run-stream fold, pill-scope + placement helpers, and
 * structural validation. Pure TypeScript — no React, no transport.
 *
 * @packageDocumentation
 * @since 1.0.0
 */

// Run / execution-history domain model + formatting helpers.
export * from "./runData";

// Live run-stream accumulator + engine-to-UI enum mappers.
export * from "./runStream";

// Workflow domain model, verb catalog, and (de)serialisation helpers.
export * from "./workflowData";

// Data-source seam: the WorkflowGateway port + validation result types.
export * from "./workflowGateway";

// Flatten / expand mapper between the engine-flat and UI-nested definitions.
export * from "./workflowMapper";

// Pill scope + verb placement legality + entry-point helpers.
export * from "./workflowScope";

// Structural (in-process) workflow validation.
export * from "./workflowValidation";
