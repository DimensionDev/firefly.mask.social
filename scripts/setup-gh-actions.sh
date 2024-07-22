#!/bin/bash

npm i -g pnpm

# Change to the submodule directory
cd src/maskbook

# Install the submodule first
pnpm install --no-frozen-lockfile

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Return to the original directory
cd -

pnpm install

# Compile i18n
pnpm run lingui:compile
