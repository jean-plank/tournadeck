#!/bin/bash

tmp=$(mktemp)

yarn run next dev transformed 2> $tmp

status=$?
error=$(cat $tmp)
firstLine=$(head -n 1 $tmp)

>&2 cat $tmp

rm $tmp

if [ $status -eq 0 ]; then
  if [ "$firstLine" == "Error: > Couldn't find any \`pages\` or \`app\` directory. Please create one under the project root" ]; then
    exit 132
  else
    exit 0
  fi
else
  exit $status
fi

