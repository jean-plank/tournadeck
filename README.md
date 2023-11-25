# tournadeck

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

## Getting Started

```bash
cp transformed/.env.example transformed/.env.local
```

Fill in empty values.

You need a Discord app for authentication:

1. Head to https://discord.com/developers/applications
2. Create an app
3. Go to OAuth2 > General:
   1. Click "Reset Secret"
   2. Copy your Client ID and Client Secret in your `.env.local` file
   3. Add `http://localhost:3000/api/discordRedirect` as a new redirect

You need a running mongo:

```bash
mkdir -p .docker-data/mongo # if needed
podman run --name=tournadeck-mongo -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=password -v .docker-data/mongo:/data/db -p 27022:27017 mongo:7
```

And start the development server:

```bash
yarn run ~macros
yarn run dev # in an other shell
```

Apparently, with my macros bootstrap, I lost Next's type checking (and linting). It shall be tested by CI (`yarn run ci`), but you might want to start type checking in a separated shell with:

```bash
yarn run ~compile
```

If you delete a Next page or a test, for example, it won't be deleted from the `transformed/` directory. You have to run:

```bash
yarn run clean
```

## Tests

Unit tests shall be named `test/**/*.spec.ts` (run by CI, `yarn run testUnit`).  
Other tests shall be named `test/**/*.test.ts` (NOT run by CI, `yarn run test` - runs all tests).

`yarn run ci` is for CI purpose.

## Code

Source code is in `src/` directory. `ts-macros` transforms it to generate `transformed/` which is used by Next (and Jest).
