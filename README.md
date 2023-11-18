# tournadeck

## Getting Started

```bash
yarn dev
```

## Tests

Unit tests shall be named `test/**/*.spec.ts` (run by CI, `yarn run jestUnit`).  
Other tests shall be named `test/**/*.test.ts` (NOT run by CI, `yarn run jest` - runs all tests).

`yarn run test` is for CI purpose.

## Yarn

This project uses yarn.

Install exact dependencies:

```bash
yarn add -E[D] <package>
```

Upgrade deps:

```bash
yarn upgrade-interactive --latest
```
