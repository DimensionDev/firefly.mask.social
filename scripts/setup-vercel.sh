#!/bin/bash

npm i -g pnpm@8.10.4

# Change to the submodule directory
cd src/maskbook

pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Build TypeScript code
npx tsc -b

# Return to the original directory
cd -

# Run Next.js build for the main project
pnpm run build:sw
pnpm run build
