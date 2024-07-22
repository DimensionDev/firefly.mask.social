#!/bin/bash

npm i -g pnpm

# Install the outer first, then cd into the submodule so submodule's patches can be applied.
pnpm install

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm for development environment
NODE_ENV=development pnpm install
pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Build TypeScript code
npx tsc -b

# Return to the original directory
cd -

# Install Node.js dependencies using npm
pnpm install

# Compile i18n
pnpm run lingui:compile

