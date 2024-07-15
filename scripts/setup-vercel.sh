#!/bin/bash

# Change to the submodule directory
cd src/maskbook

pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Return to the original directory
cd -

# Create symbolic links for packages
# It makes maskbook repo to share the same packages with the primary repo
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@tanstack+"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@mui/material"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@dimensiondev+holoflows-kit"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "react-use@17.4.0"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "react-markdown@8.0.7"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "react-i18next@13.0.2"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "async-call-rpc@6.4.0"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "idb@7.1.1"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "lodash-es@4.17.21"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "notistack@2.0.8"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "urlcat@3.1.0"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@solana/spl-token@0.1.8"
./scripts/setup-packages.sh ./src/maskbook/node_modules ./node_modules "@solana/web3.js@1.75.0"

# Compile i18n
pnpm run lingui:compile

# Run Next.js build for the main project
pnpm run build:sw
pnpm run build:logs
pnpm run build
