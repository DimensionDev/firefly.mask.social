import { AsyncStatus } from '@/constants/enum.js';
import { EMPTY_ARRAY } from '@/constants/subscription.js';
import { initWallet, type WalletAPI } from '@/mask/bindings/index.js';
import { connectMaskWithWagmi } from '@/mask/helpers/connectWagmiWithMask.js';
import { createRejectCallback } from '@/mask/helpers/createRejectCallback.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

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
        openWalletConnectDialog: createRejectCallback('openWalletConnectDialog'),
        closeWalletConnectDialog: createRejectCallback('closeWalletConnectDialog'),
    },
    signWithPersona: createRejectCallback('signWithPersona'),
};

try {
    await initWallet(WalletIO);
    await connectMaskWithWagmi();
} catch (error) {
    console.error('[mask] Failed to initialize wallet', error);
} finally {
    useGlobalState.getState().setWeb3StateAsyncStatus(AsyncStatus.Idle);
}
