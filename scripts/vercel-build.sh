#!/bin/bash

npm i -g pnpm@8.10.4

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm
NODE_ENV=development pnpm install

npx gulp polyfill
npx gulp codegen

# Return to the original directory
cd -

# Patch packages
npm run postinstall

# Run Next.js build for the main project
next build
