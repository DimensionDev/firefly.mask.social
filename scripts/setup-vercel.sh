#!/bin/bash

# Change to the submodule directory
cd src/maskbook

pnpm install

# Run Gulp tasks for polyfill and code generation
npx gulp polyfill
npx gulp codegen

# Build TypeScript code
npx tsc -b

# Return to the original directory
cd -

# Remove unused folders
rm -rf ./src/maskbook/packages/mask/popups
rm -rf ./src/maskbook/packages/mask/dashboard
rm -rf ./src/maskbook/packages/mask/background
rm -rf ./src/maskbook/packages/mask/swap
rm -rf ./src/maskbook/packages/backup-format/
rm -rf ./src/maskbook/packages/gun-utils/

# Remove unused plugins
rm -rf src/maskbook/packages/plugins/Approval
rm -rf src/maskbook/packages/plugins/ArtBlocks
rm -rf src/maskbook/packages/plugins/Avatar
rm -rf src/maskbook/packages/plugins/Claim
rm -rf src/maskbook/packages/plugins/Collectible
rm -rf src/maskbook/packages/plugins/CrossChainBridge
rm -rf src/maskbook/packages/plugins/CyberConnect
rm -rf src/maskbook/packages/plugins/FileService
rm -rf src/maskbook/packages/plugins/FriendTech
rm -rf src/maskbook/packages/plugins/Gitcoin
rm -rf src/maskbook/packages/plugins/GoPlusSecurity
rm -rf src/maskbook/packages/plugins/Handle
rm -rf src/maskbook/packages/plugins/MaskBox
rm -rf src/maskbook/packages/plugins/NextID
rm -rf src/maskbook/packages/plugins/Pets
rm -rf src/maskbook/packages/plugins/ProfileCard
rm -rf src/maskbook/packages/plugins/RSS3
rm -rf src/maskbook/packages/plugins/Savings
rm -rf src/maskbook/packages/plugins/ScamSniffer
rm -rf src/maskbook/packages/plugins/ScamWarning
rm -rf src/maskbook/packages/plugins/SmartPay
rm -rf src/maskbook/packages/plugins/SwitchLogo
rm -rf src/maskbook/packages/plugins/Tips
rm -rf src/maskbook/packages/plugins/Trader
rm -rf src/maskbook/packages/plugins/Transak
rm -rf src/maskbook/packages/plugins/VCent
rm -rf src/maskbook/packages/plugins/Web3Profile
rm -rf src/maskbook/packages/plugins/template

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
