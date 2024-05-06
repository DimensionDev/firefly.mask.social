#!/bin/bash

npm i -g pnpm@8.10.4

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm for development environment
NODE_ENV=development pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Return to the original directory
cd -

# Install Node.js dependencies using npm
pnpm install

# Compile i18n
pnpm run lingui:compile
