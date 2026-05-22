#!/usr/bin/env bash

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "No node_modules found. Running npm install..."
  npm install
fi

node .config/do.mjs "$@"
