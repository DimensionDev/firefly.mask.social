#!/bin/bash

# Initialize Git submodules in the repository
git submodule init

# Update Git submodules to the latest commit
git submodule update

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

# Install Node.js dependencies using npm
npm install

# Patch packages
npm run postinstall

# Run a type checking script using npm
npm run typecheck
