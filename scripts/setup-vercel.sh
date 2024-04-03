#!/bin/bash

# Change to the submodule directory
cd src/maskbook

pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp codegen
npx gulp polyfill

# Build TypeScript code
npx tsc -b

# Remove unused folders
rm -rf packages/mask/popups
rm -rf packages/mask/dashboard
rm -rf packages/mask/background
rm -rf packages/mask/swap
rm -rf packages/backup-format/
rm -rf packages/gun-utils/

# Remove unused plugins
rm -rf packages/plugins/Approval
rm -rf packages/plugins/ArtBlocks
rm -rf packages/plugins/Avatar
rm -rf packages/plugins/Claim
rm -rf packages/plugins/Collectible
rm -rf packages/plugins/CrossChainBridge
rm -rf packages/plugins/CyberConnect
rm -rf packages/plugins/FileService
rm -rf packages/plugins/FriendTech
rm -rf packages/plugins/Gitcoin
rm -rf packages/plugins/GoPlusSecurity
rm -rf packages/plugins/Handle
rm -rf packages/plugins/MaskBox
rm -rf packages/plugins/NextID
rm -rf packages/plugins/Pets
rm -rf packages/plugins/ProfileCard
rm -rf packages/plugins/RSS3
rm -rf packages/plugins/Savings
rm -rf packages/plugins/ScamSniffer
rm -rf packages/plugins/ScamWarning
rm -rf packages/plugins/SmartPay
rm -rf packages/plugins/SwitchLogo
rm -rf packages/plugins/Tips
rm -rf packages/plugins/Trader
rm -rf packages/plugins/Transak
rm -rf packages/plugins/VCent
rm -rf packages/plugins/Web3Profile
rm -rf packages/plugins/template

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

# Compile i18n
pnpm run lingui:compile

# Run Next.js build for the main project
pnpm run build:sw
pnpm run build:logs
pnpm run build
