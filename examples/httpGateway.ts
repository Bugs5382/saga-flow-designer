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

// A real WorkflowGateway adapter over the go-saga-orchestration HTTP API. This
// is the demo talking to an actual engine (cmd/api), not the mock — it proves
// the components + mapper work against real go-saga output. It maps the engine's
// flat definitions to the nested UI model with expandDefinition/flattenDefinition.

import {
  expandDefinition,
  flattenDefinition,
  type Run,
  type RunStatus,
  validateWorkflow,
  type ValidationResult,
  type WorkflowDefinition,
  type WorkflowGateway,
} from "../src";

interface EngineRun {
  current_step?: string;
  definition_id?: string;
  id: string;
  started_at?: string;
  state?: string;
  terminal_at?: string;
  workflow_id: string;
}

const RUN_STATUS: Record<string, RunStatus> = {
  cancelled: "cancelled",
  compensating: "running",
  failed: "failed",
  paused: "paused",
  pending: "running",
  running: "running",
  succeeded: "succeeded",
};

// A go-saga engine definition is already the flat shape expandDefinition reads.
const toDefinition = (engine: unknown, id?: string): WorkflowDefinition =>
  expandDefinition(engine as Parameters<typeof expandDefinition>[0], id);

const toRun = (r: EngineRun): Run => ({
  durationMs:
    r.terminal_at && r.started_at
      ? Date.parse(r.terminal_at) - Date.parse(r.started_at)
      : undefined,
  events: [],
  finishedAt: r.terminal_at,
  id: r.id,
  path: [],
  startedAt: r.started_at ?? new Date().toISOString(),
  status: RUN_STATUS[r.state ?? "pending"] ?? "running",
  stepRuns: [],
  trigger: "manual",
  workflowId: r.definition_id ?? r.workflow_id,
  workflowKey: r.workflow_id,
});

const requestJson = async (base: string, path: string, init?: RequestInit): Promise<unknown> => {
  const res = await globalThis.fetch(`${base}${path}`, init);
  if (!res.ok) throw new Error(`go-saga ${path} -> HTTP ${res.status}`);
  return res.json();
};

const saveDefinition = (base: string, wf: WorkflowDefinition): Promise<WorkflowDefinition> =>
  requestJson(base, "/api/v1/workflows", {
    body: JSON.stringify(flattenDefinition(wf)),
    headers: { "content-type": "application/json" },
    method: "POST",
  }).then((saved) => toDefinition(saved, (saved as { definition_id?: string }).definition_id));

// A minimal draft the designer can open immediately after "create".
const seedDraft = (): WorkflowDefinition =>
  expandDefinition({
    description: "",
    id: `draft.${Date.now()}`,
    name: "New workflow",
    published: false,
    start: "end",
    steps: [{ id: "end", type: "end" }],
    version: 1,
  });

const unsupported = (op: string): never => {
  throw new Error(`go-saga exposes no ${op} endpoint`);
};

const noop = (): void => {};

// Create a WorkflowGateway backed by a go-saga cmd/api instance at `base`
// (e.g. "/gs" behind a dev proxy, or an absolute URL). Operations the engine
// does not expose over HTTP throw loudly rather than fail silently.
export const createHttpGateway = (base: string): WorkflowGateway => ({
  createWorkflow: () => saveDefinition(base, seedDraft()),
  deleteWorkflow: () => unsupported("delete"),
  getRun: async (runId) => {
    try {
      return toRun((await requestJson(base, `/api/v1/sagas/${runId}`)) as EngineRun);
    } catch {
      return;
    }
  },
  getWorkflow: async (id) => {
    try {
      return toDefinition(await requestJson(base, `/api/v1/workflows/${id}`), id);
    } catch {
      return;
    }
  },
  listAllRuns: async () => {
    const body = (await requestJson(base, "/api/v1/sagas")) as {
      sagas?: EngineRun[];
    };
    return (body.sagas ?? []).map((r) => toRun(r));
  },
  listRuns: async (workflowId) => {
    const body = (await requestJson(
      base,
      `/api/v1/sagas?workflow_id=${encodeURIComponent(workflowId)}`,
    )) as { sagas?: EngineRun[] };
    return (body.sagas ?? []).map((r) => toRun(r));
  },
  listWorkflows: async () => {
    const body = (await requestJson(base, "/api/v1/workflows")) as {
      workflows?: unknown[];
    };
    return (body.workflows ?? []).map((w) => toDefinition(w, (w as { id?: string }).id));
  },
  restoreWorkflow: () => unsupported("restore"),
  saveWorkflow: (wf) => saveDefinition(base, wf),
  setWorkflowEnabled: () => unsupported("enable/disable"),
  subscribeRun: (runId, onUpdate) => {
    // The engine's per-run stream is a WebSocket needing the postgres backend;
    // against the memory store it is unavailable, so fetch the run once.
    void requestJson(base, `/api/v1/sagas/${runId}`)
      .then((r) => onUpdate(toRun(r as EngineRun)))
      .catch(noop);
    return noop;
  },
  validateWorkflow: (wf): Promise<ValidationResult> => Promise.resolve(validateWorkflow(wf)),
});
