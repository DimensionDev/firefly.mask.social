/* eslint-disable no-restricted-imports */

/**
 * This file re-exports the bindings from the maskbook packages.
 * Always use absolute imports to ensure the dependencies tree is clean.
 */

export { CrossIsolationMessages } from '@/maskbook/packages/shared-base/src/Messages/CrossIsolationEvents.js';
export { addShareBaseI18N } from '@/maskbook/packages/shared-base-ui/src/locales/languages.js';
export { FireflyRedPacket } from '@/maskbook/packages/web3-providers/src/Firefly/RedPacket.js';
export { getRegisteredWeb3Networks } from '@/maskbook/packages/web3-providers/src/Manager/index.js';
export { initWallet } from '@/maskbook/packages/web3-providers/src/Manager/io.js';
export type { RedPacketJSONPayload } from '@/maskbook/packages/web3-providers/src/RedPacket/types.js';
export { SimpleHashEVM } from '@/maskbook/packages/web3-providers/src/SimpleHash/apis/EVM.js';
export { SimpleHashSolana } from '@/maskbook/packages/web3-providers/src/SimpleHash/apis/Solana.js';
export { FireflyRedPacketAPI } from '@/maskbook/packages/web3-providers/src/types/Firefly.js';
export { SimpleHash } from '@/maskbook/packages/web3-providers/src/types/SimpleHash.js';
export type { WalletAPI } from '@/maskbook/packages/web3-providers/src/types/Wallet.js';
export { ExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/ExplorerResolver.js';
export type { BaseHubOptions } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/HubOptions.js';
export { EVMWeb3 } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ConnectionAPI.js';
export { EVMChainResolver } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ResolverAPI.js';
export { EVMExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ResolverAPI.js';
export { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
export { getCoinInfo } from '@/maskbook/packages/web3-providers/src/CoinGecko/apis/base.js';
