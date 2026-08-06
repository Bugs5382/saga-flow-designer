// Package entry / public API surface.
//
// The dependency-free logic core of the Flow Designer: the workflow + run
// domain model and verb catalog, the gateway seam interface, the flatten/expand
// engine mapper, the live run-stream fold, pill-scope + placement helpers, and
// structural validation. Pure TypeScript — no React, no transport.

// Workflow domain model, verb catalog, and (de)serialisation helpers.
export * from "./workflowData";

// Run / execution-history domain model + formatting helpers.
export * from "./runData";

// Data-source seam: the WorkflowGateway port + validation result types.
export * from "./workflowGateway";

// Pill scope + verb placement legality + entry-point helpers.
export * from "./workflowScope";

// Flatten / expand mapper between the engine-flat and UI-nested definitions.
export * from "./workflowMapper";

// Live run-stream accumulator + engine-to-UI enum mappers.
export * from "./runStream";

// Structural (in-process) workflow validation.
export * from "./workflowValidation";
