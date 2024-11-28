/* eslint-disable no-restricted-imports */

/**
 * This file re-exports the bindings from the maskbook packages.
 * Always use absolute imports to ensure the dependencies tree is clean.
 *
 * Unsafe packages import paths:
 * /from\s'@masknet/(?!web3-shared|kit|public-api|encryption|base|typed-message|shared-base)/i
 *
 */

/* packages/base/src/Identifier/identifier.js */ export { ProfileIdentifier } from '@/maskbook/packages/base/src/Identifier/identifier.js';
/* packages/plugin-infra/src/dom/context.js */ export type { __UIContext__ } from '@/maskbook/packages/plugin-infra/src/dom/context.js';
/* packages/plugin-infra/src/site-adaptor/context.js */ export { __setSiteAdaptorContext__, type __SiteAdaptorContext__ } from '@/maskbook/packages/plugin-infra/src/site-adaptor/context.js';
/* packages/plugin-infra/src/types.js */ export type { IdentityResolved } from '@/maskbook/packages/plugin-infra/src/types.js';
/* packages/shared/src/locales/languages.js */ export { addSharedI18N } from '@/maskbook/packages/shared/src/locales/languages.js';
/* packages/shared-base/src/i18n/instance.js */ export { i18NextInstance, updateLanguage } from '@/maskbook/packages/shared-base/src/i18n/instance.js';
/* packages/shared-base/src/Messages/CrossIsolationEvents.js */ export { CrossIsolationMessages } from '@/maskbook/packages/shared-base/src/Messages/CrossIsolationEvents.js';
/* packages/shared-base/src/serializer/index.js */ export { encoder } from '@/maskbook/packages/shared-base/src/serializer/index.js';
/* packages/shared-base-ui/src/locales/languages.js */ export { addShareBaseI18N } from '@/maskbook/packages/shared-base-ui/src/locales/languages.js';
/* packages/theme/src/Theme/colors.js */ export { MaskColors } from '@/maskbook/packages/theme/src/Theme/colors.js';
/* packages/theme/src/Theme/theme.js */ export { MaskDarkTheme, MaskLightTheme } from '@/maskbook/packages/theme/src/Theme/theme.js';
/* packages/theme/src/UIHelper/makeStyles.js */ export { makeStyles } from '@/maskbook/packages/theme/src/UIHelper/makeStyles.js';
/* packages/web3-providers/src/CoinGecko/apis/base.js */ export { getCoinInfo } from '@/maskbook/packages/web3-providers/src/CoinGecko/apis/base.js';
/* packages/web3-providers/src/Manager/index.js */ export { getRegisteredWeb3Networks } from '@/maskbook/packages/web3-providers/src/Manager/index.js';
/* packages/web3-providers/src/Manager/io.js */ export { initWallet } from '@/maskbook/packages/web3-providers/src/Manager/io.js';
/* packages/web3-providers/src/SimpleHash/apis/EVM.js */ export { SimpleHashEVM } from '@/maskbook/packages/web3-providers/src/SimpleHash/apis/EVM.js';
/* packages/web3-providers/src/SimpleHash/apis/Solana.js */ export { SimpleHashSolana } from '@/maskbook/packages/web3-providers/src/SimpleHash/apis/Solana.js';
/* packages/web3-providers/src/types/SimpleHash.js */ export { SimpleHash } from '@/maskbook/packages/web3-providers/src/types/SimpleHash.js';
/* packages/web3-providers/src/types/Wallet.js */ export type { WalletAPI } from '@/maskbook/packages/web3-providers/src/types/Wallet.js';
/* packages/web3-providers/src/Web3/Base/apis/ExplorerResolver.js */ export { ExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/ExplorerResolver.js';
/* packages/web3-providers/src/Web3/Base/apis/HubOptions.js */ export type { BaseHubOptions } from '@/maskbook/packages/web3-providers/src/Web3/Base/apis/HubOptions.js';
/* packages/web3-providers/src/Web3/EVM/apis/ConnectionAPI.js */ export { EVMWeb3 } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ConnectionAPI.js';
/* packages/web3-providers/src/Web3/EVM/apis/ResolverAPI.js */ export { EVMChainResolver, EVMExplorerResolver, EVMNetworkResolver } from '@/maskbook/packages/web3-providers/src/Web3/EVM/apis/ResolverAPI.js';
/* packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js */ export { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';

