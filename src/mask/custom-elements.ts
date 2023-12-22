/* eslint simple-import-sort/imports: 0 */

// setup
import '@/mask/setup/locale.js';
import '@/mask/setup/wallet.js';
import '@/mask/setup/theme.js';
import '@/mask/setup/custom-event-provider.js';
import '@/mask/plugin-host/enable.js';

// custom elements
import '@/mask/custom-elements/PageInspector.js';
import '@/mask/custom-elements/CalendarWidget.js';
import '@/mask/custom-elements/DecryptedPost.js';

import { setupBuildInfoManually } from '@masknet/flags/build-info';
import { setPluginDebuggerMessages } from '@/mask/message-host/index.js';
import { EVMWeb3 } from '@masknet/web3-providers';
import { ChainId, ProviderType } from '@masknet/web3-shared-evm';
import { getAccount, getNetwork } from 'wagmi/actions';

setupBuildInfoManually({
    channel:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
            ? 'beta'
            : process.env.NODE_ENV === 'production'
              ? 'stable'
              : 'insider',
});

// plugin messages
if (process.env.NODE_ENV === 'development') {
    await import('@masknet/plugin-debugger/messages').then((module) =>
        setPluginDebuggerMessages(module.PluginDebuggerMessages),
    );
}

// use custom event provider if a wallet connected
// if no wallet connected, the rest connection will be monitored in custom-event-provider.ts
const account = getAccount();

if (account.isConnected) {
    await EVMWeb3.connect({
        chainId: getNetwork().chain?.id ?? ChainId.Mainnet,
        providerType: ProviderType.CustomEvent,
    });
}
