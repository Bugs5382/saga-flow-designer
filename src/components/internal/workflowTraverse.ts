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
import { type Stage, type Step, type WorkflowDefinition } from "../../workflowData";

// Read-only traversal helpers used by the designer to find nodes by id. Pure,
// dependency-free, and internal to the component layer.

// Walk every step across a steps array (including branch/child lanes).
export const walkSteps = (steps: Step[], visit: (step: Step) => void): void => {
  for (const step of steps) {
    visit(step);
    for (const branch of step.branches ?? []) walkSteps(branch.steps, visit);
    for (const child of step.children ?? []) walkSteps(child.steps, visit);
  }
};

// Walk every step across all stages of a definition.
export const walkWorkflow = (workflow: WorkflowDefinition, visit: (step: Step) => void): void => {
  for (const stage of workflow.stages) walkSteps(stage.steps, visit);
};

// Find a step by id across all stages, or undefined.
export const findStep = (stages: Stage[], id: string): Step | undefined => {
  let found: Step | undefined;
  for (const stage of stages)
    walkSteps(stage.steps, (step) => {
      if (step.id === id) found = step;
    });
  return found;
};
