import { WalletConnectQRCodeModal } from '@masknet/shared';
import { initWallet } from '@masknet/web3-providers';
import type { WalletAPI } from '@masknet/web3-providers/types';

import { EMPTY_ARRAY } from '@/constants/subscription.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { createRejectCallback } from '@/helpers/createRejectCallback.js';

const WalletIO: WalletAPI.IOContext = {
    MaskWalletContext: {
        wallets: EMPTY_ARRAY,
        allPersonas: EMPTY_ARRAY,
        resetAllWallets: createRejectCallback('resetAllWallets'),
        removeWallet: createRejectCallback('removeWallet'),
        renameWallet: createRejectCallback('renameWallet'),
        addWallet: createRejectCallback('addWallet'),
        sdk_grantEIP2255Permission: createRejectCallback('sdk_grantEIP2255Permission'),
        selectMaskWalletAccount: createRejectCallback('selectMaskWalletAccount'),
        disconnectAllWalletsFromOrigin: createRejectCallback('disconnectAllWalletsFromOrigin'),
    },
    MessageContext: {
        send: createRejectCallback('send'),
        openPopupWindow: createRejectCallback('openPopupWindow'),
        hasPaymentPassword: createRejectCallback('hasPaymentPassword'),
    },
    WalletConnectContext: {
        openWalletConnectDialog: async (uri: string) => {
            await WalletConnectQRCodeModal.openAndWaitForClose({
                uri,
            });
        },
        closeWalletConnectDialog: () => {
            WalletConnectQRCodeModal.close();
        },
    },
    signWithPersona: createRejectCallback('signWithPersona'),
};

await initWallet(WalletIO);
await connectMaskWithWagmi();
