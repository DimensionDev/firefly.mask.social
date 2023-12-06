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

# Create symbolic links for tanstack packages
# It makes maskbook repo to share the same packages with the primary repo
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@tanstack+"

# Compile i18n
pnpm run lingui:compile

# Run Next.js build for the main project
pnpm run build:sw
pnpm run build
