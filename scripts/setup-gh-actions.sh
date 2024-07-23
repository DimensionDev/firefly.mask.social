#!/bin/bash

npm i -g pnpm

# Install the outer first, then cd into the submodule so submodule's patches can be applied.
pnpm install

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm for development environment
pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Return to the original directory
cd -

# Compile i18n
pnpm run lingui:compile

