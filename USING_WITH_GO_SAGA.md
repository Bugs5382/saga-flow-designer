# 🔗 Using saga-flow-designer with go-saga

This package is engine-agnostic, but it pairs naturally with the
[go-saga-orchestration](https://github.com/Bugs5382/go-saga-orchestration) engine,
which exposes exactly the HTTP surface the components need. You implement a
`WorkflowGateway` over go-saga's REST/WebSocket API and inject it.

A complete, runnable adapter lives in [`demo/httpGateway.ts`](./demo/httpGateway.ts).

---

## 1. Run go-saga standalone

go-saga ships runnable binaries — `cmd/api` (the REST/WebSocket surface) and
`cmd/engine` (the saga executor). `cmd/api` requires a RabbitMQ broker to boot;
the store is selectable (`STORE_TYPE`).

### Minimal: definitions + read-only runs (memory store, no database)

```sh
# from a go-saga-orchestration checkout
go build -o gs-api ./cmd/api

# a broker (empty vhost, so no topology collisions)
docker run -d --name gs-rmq -p 5672:5672 rabbitmq:3.13

STORE_TYPE=memory \
WORKFLOW_API_PORT=8080 \
RABBITMQ_URL=amqp://guest:guest@localhost:5672/ \
./gs-api
```

`GET http://localhost:8080/api/v1/workflows` now serves the (empty) definitions
API. This is enough to list, open, edit, and save definitions from the designer.

### Full: executing runs + live streaming (postgres store + engine)

The per-run WebSocket stream (`/api/v1/sagas/{id}/stream`) requires the postgres
backend, and runs only advance when the engine is running:

```sh
go build -o gs-api ./cmd/api
go build -o gs-engine ./cmd/engine

export DATABASE_DSN='postgres://user:pass@localhost:5432/gosaga?sslmode=disable'
export RABBITMQ_URL='amqp://guest:guest@localhost:5672/'
export STORE_TYPE=postgres

WORKFLOW_API_PORT=8080 ./gs-api &   # REST + stream
./gs-engine &                       # executes sagas
```

> Sharing a broker with another go-saga deployment? Give this one its own vhost
> (`rabbitmqctl add_vhost gsdev` + set permissions, then
> `RABBITMQ_URL=amqp://user:pass@host:5672/gsdev`) so queue declarations don't
> collide.

### Seed a definition

```sh
curl -X POST http://localhost:8080/api/v1/workflows \
  -H 'content-type: application/json' \
  -d '{
    "id": "order.fulfillment", "name": "Order Fulfillment", "version": 1,
    "published": true, "start": "charge",
    "steps": [
      { "id": "charge", "type": "action", "action": "billing.charge", "next": "ship" },
      { "id": "ship",   "type": "action", "action": "warehouse.ship", "next": "done" },
      { "id": "done",   "type": "end" }
    ]
  }'
```

---

## 2. Adapt go-saga to the `WorkflowGateway`

The mapper handles go-saga's flat definitions (including the `branches` map and
convergent merges) directly, so the adapter is thin — map endpoints and delegate
the shape translation:

```ts
import {
  expandDefinition,
  flattenDefinition,
  validateWorkflow,
  type WorkflowGateway,
} from "@bugs5382/saga-flow-designer";

export const createGoSagaGateway = (base: string): WorkflowGateway => ({
  listWorkflows: async () => {
    const { workflows = [] } = await get(`${base}/api/v1/workflows`);
    return workflows.map((w) => expandDefinition(w, w.id));
  },
  getWorkflow: async (id) =>
    expandDefinition(await get(`${base}/api/v1/workflows/${id}`), id),
  saveWorkflow: async (wf) => {
    const saved = await post(`${base}/api/v1/workflows`, flattenDefinition(wf));
    return expandDefinition(saved, saved.definition_id);
  },
  validateWorkflow: async (wf) => validateWorkflow(wf),
  listAllRuns: async () => (await get(`${base}/api/v1/sagas`)).sagas.map(toRun),
  getRun: async (id) => toRun(await get(`${base}/api/v1/sagas/${id}`)),
  subscribeRun: (id, onUpdate) => openRunStream(base, id, onUpdate), // WS -> foldFrame
  // createWorkflow / listRuns / etc.
});
```

- **Definitions** — `GET/POST /api/v1/workflows`, `GET /api/v1/workflows/{id}` (by
  storage UUID **or** business workflow id). Map with `expandDefinition` /
  `flattenDefinition`.
- **Runs** — `GET /api/v1/sagas` (envelope `{sagas,total,limit,offset}`),
  `GET /api/v1/sagas/{id}`.
- **Live** — `GET /api/v1/sagas/{run_id}/stream` is a WebSocket emitting
  `{type:"run"|"event", data}` frames; fold them with `seedRun` / `foldFrame`
  (see [`demo/httpGateway.ts`](./demo/httpGateway.ts)).

## 3. Mount it

```tsx
import { FlowDesigner } from "@bugs5382/saga-flow-designer";

const gateway = createGoSagaGateway("/gs"); // proxied to the engine (avoid CORS)

<FlowDesigner gateway={gateway} definitionId="order.fulfillment" />;
```

## 4. Try it — the bundled demo

The `demo/` app can run against a live go-saga engine instead of the mock:

```sh
VITE_GS_BASE=/gs VITE_GS_TARGET=http://localhost:8080 npm run demo
```

`VITE_GS_TARGET` is proxied at `/gs` by the demo's Vite config, so browser
requests stay same-origin.
