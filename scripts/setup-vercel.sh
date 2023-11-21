#!/bin/bash

npm i -g pnpm@8.10.4

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm for development environment
NODE_ENV=development pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Build TypeScript code
npx tsc -b

# Return to the original directory
cd -

# Patch packages
npx patch-package

# Run Next.js build for the main project
next build
