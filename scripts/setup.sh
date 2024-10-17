#!/bin/bash

# Initialize Git submodules in the repository
git submodule init

# Update Git submodules to the latest commit
git submodule update

# Install Node.js dependencies using npm

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm
pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Run TypeScript compiler for the submodule
npx tsc -b ./

# Return to the original directory
cd -

pnpm install

# Patch packages
# pnpm run postinstall

# Run a type checking script using npm
pnpm run typecheck
