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

## Getting started

Download latest PocketBase version from https://pocketbase.io/docs (to the root of this project)

Start PocketBase:

```bash
./pocketbase serve
```

Create an admin account at http://127.0.0.1:8090/_

You need a Discord app for authentication:

1. Head to https://discord.com/developers/applications
2. Create an app
3. Go to OAuth2 > General:
   1. Click "Reset Secret"
   2. Copy your Client ID and Client Secret in PocketBase settings
   3. Add `http://127.0.0.1:8090/api/oauth2-redirect` as a new redirect

## Development

Start PocketBase:

```bash
./pocketbase serve
```

Start Next:

```bash
yarn dev
```
