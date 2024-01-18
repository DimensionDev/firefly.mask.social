import { WalletConnectQRCodeModal } from '@masknet/shared';
import { EMPTY_ARRAY } from '@masknet/shared-base';
import { initWallet } from '@masknet/web3-providers';
import type { WalletAPI } from '@masknet/web3-providers/types';

import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { createRejectCallback } from '@/helpers/createRejectCallback.js';

const WalletIO: WalletAPI.IOContext = {
    wallets: EMPTY_ARRAY,
    hasPaymentPassword: createRejectCallback('hasPaymentPassword'),
    openPopupWindow: createRejectCallback('openPopupWindow'),
    openWalletConnectDialog: async (uri: string) => {
        await WalletConnectQRCodeModal.openAndWaitForClose({
            uri,
        });
    },
    closeWalletConnectDialog: () => {
        WalletConnectQRCodeModal.close();
    },
    SDK_grantEIP2255Permission: createRejectCallback('SDK_grantEIP2255Permission'),
    disconnectAllWalletsFromOrigin: createRejectCallback('disconnectAllWalletsFromOrigin'),
    selectMaskWalletAccount: createRejectCallback('selectMaskWalletAccount'),
    addWallet: createRejectCallback('addWallet'),
    signWithPersona: createRejectCallback('signWithPersona'),
    send: createRejectCallback('send'),
};

await initWallet(WalletIO);
await connectMaskWithWagmi();
