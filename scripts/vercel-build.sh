#!/bin/bash

npm i -g pnpm@8.10.4

# Change to the submodule directory
cd src/maskbook

# Install dependencies using pnpm
pnpm install

# Return to the original directory
cd -

# Run Next.js build for the main project
next build
