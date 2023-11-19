# tournadeck

## Getting Started

```bash
cp .env.example .env.local
```

Fill in empty values.

You need a Discord app for authentication:

1. Head to https://discord.com/developers/applications
2. Create an app
3. Go to OAuth2 > General:
   1. Click "Reset Secret"
   2. Copy your Client ID and Client Secret in your `.env.local` file
   3. Add `http://localhost:3000/discordRedirect` as a new redirect

You need a running mongo:

```bash
mkdir -p .docker-data/mongo # if needed
podman run --name=tournadeck-mongo -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=password -v .docker-data/mongo:/data/db -p 27022:27017 mongo:7
```

And start the development server:

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
