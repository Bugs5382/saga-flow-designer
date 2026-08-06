# @bugs5382/saga-flow-designer

React components and utilities for visualising and editing saga-orchestration
workflows and runs. Built on top of [`@xyflow/react`](https://reactflow.dev/),
shipped as ESM and CommonJS with TypeScript types.

> Status: early scaffold. The components and utilities are not published yet;
> this package currently exports only a version marker.

## Install

```sh
npm install @bugs5382/saga-flow-designer
```

`react`, `react-dom`, and `@xyflow/react` are peer dependencies and must be
installed in the host application.

```sh
npm install react react-dom @xyflow/react
```

## Usage

```ts
import { VERSION } from "@bugs5382/saga-flow-designer";

console.log(VERSION);
```

Component and utility APIs are documented as they land. Docs coming.

## Development

```sh
npm install
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest run
npm run build       # tsup -> dist/
```

## License

Apache-2.0
