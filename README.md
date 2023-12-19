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

First:

```bash
cp .env.local.example .env.local
```

See below for `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` values.

### Create a Discord app for authentication

1. Head to https://discord.com/developers/applications
2. Create an app
3. Go to OAuth2 > General:
   1. Click "Reset Secret"
   2. Copy your Client ID and Client Secret to `.env.local`
   3. Add `http://127.0.0.1:8090/api/oauth2-redirect` as a new redirect

### PocketBase

Download latest PocketBase version from https://pocketbase.io/docs (to the root of this project)

Start PocketBase:

```bash
./pocketbase serve --dev
```

In an other shell, start Next.js (to initialize PocketBase):

```bash
yarn dev
```

Log in as admin at http://127.0.0.1:8090/_

- email: `ne@x.t`
- password: `Password123`

(See [.env.development](.env.development).)

## Development

Start PocketBase:

```bash
./pocketbase serve --dev
```

In an other shell, start Next.js:

```bash
yarn dev
```

## Clean db

Stop PocketBase and Next.js

```bash
rm -fr pb_data
```

And restart PocketBase and Next.js
