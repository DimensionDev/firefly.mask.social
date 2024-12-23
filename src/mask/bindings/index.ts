'use client'
/* eslint-disable no-restricted-imports */

/**
 * This file re-exports the bindings from the maskbook packages.
 * Always use absolute imports to ensure the dependencies tree is clean.
 *
 * Unsafe packages import paths:
 * /from\s'@masknet/(?!web3-shared|kit|public-api|encryption|base|typed-message|shared-base)/i
 *
 */

export { ProfileIdentifier } from '@/maskbook/packages/base/src/Identifier/identifier.js';
export { encoder } from '@/maskbook/packages/shared-base/src/serializer/index.js';
export { getCoinInfo } from '@/maskbook/packages/web3-providers/src/CoinGecko/apis/base.js';
export { getRegisteredWeb3Networks } from '@/maskbook/packages/web3-providers/src/Manager/index.js';
export  { NFTScanNonFungibleTokenEVM } from '@/maskbook/packages/web3-providers/src/NFTScan/apis/NonFungibleTokenAPI_EVM.js';
export { SimpleHash } from '@/maskbook/packages/web3-providers/src/types/SimpleHash.js';
export { ExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/ExplorerResolver.js';
export type { BaseHubOptions } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/HubOptions.js';
export { EVMWeb3 } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ConnectionAPI.js';
export { EVMChainResolver, EVMExplorerResolver, EVMNetworkResolver } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ResolverAPI.js';
export { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
