#!/bin/bash

trap "echo; echo 'Cleaning up macros...'; yarn run macrosClean 1> /dev/null && echo 'Done.'" SIGINT

yarn run nodemon -w src -w test -e ts,tsx -x "yarn run macros"
