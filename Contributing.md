# Contributing

## Requirements

- Node.js 22 or later
- PNPM 11 or later

Install dependencies from the workspace root and run each package's tests:

```sh
pnpm install
pnpm -r test
```

Each package owns its test script and test tooling. The scripts use Node.js's built-in test runner with `@swc-node/register` and the root `.swcrc`, which enables ECMAScript Stage 3 decorators and automatic JSX runtime.

```sh
pnpm --filter ai-sdk-mobx test
pnpm --filter ai-ui-react test
```

`ai-sdk-mobx` tests cover SDK models and JavaScript logic. `ai-ui-react` uses React testing library and JSDOM to test TSX rendering.

## Workspace

- `packages/ai-sdk-mobx`: MobX AI SDK models
- `packages/ai-ui-react`: React AI interface components

Both packages are public. The UI package depends on the SDK package through the PNPM workspace; preserve the `ai-ui-react → ai-sdk-mobx` dependency direction when adding package dependencies.
