#!/bin/bash

set -e

CONTAINER_ALREADY_STARTED="CONTAINER_ALREADY_STARTED"

if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED

    mkdir -p "$APP_DATA_VOLUME"
    cp -r dist/client/* "$APP_DATA_VOLUME"  
fi

# Start PocketBase

export PB_ENCRYPTION_KEY="$(cat .pbEncryptionKey)"
./pocketbase serve --encryptionEnv=PB_ENCRYPTION_KEY &

# Start Next.js
node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
