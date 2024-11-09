#!/bin/sh

set -e

./pocketbase update

# Start PocketBase
export PB_ENCRYPTION_KEY="$(cat .pbEncryptionKey)"
./pocketbase serve --http=0.0.0.0:8090 --encryptionEnv=PB_ENCRYPTION_KEY &

# Start Next.js
node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
