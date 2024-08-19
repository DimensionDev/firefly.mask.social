import { t, Trans } from '@lingui/macro';
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useSignMessage } from 'wagmi';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface AddWalletButtonProps extends Omit<ClickableButtonProps, 'children'> {
    connections: FireflyWalletConnection[];
    onSuccess?: () => void;
}

export const AddWalletButton = memo<AddWalletButtonProps>(function AddWalletButton({
    disabled = false,
    connections,
    onSuccess,
    ...rest
}) {
    const account = useAccount();
    const accountModal = useAccountModal();
    const { signMessageAsync } = useSignMessage();
    const connectModal = useConnectModal();

    const [{ loading }, handleAddWallet] = useAsyncFn(async () => {
        try {
            const address = account.address;
            if (!account.isConnected || !address) {
                return connectModal.openConnectModal?.();
            }

            const existedConnection = connections.find((connection) => isSameAddress(connection.address, address));
            if (existedConnection) {
                const addressName = existedConnection.ens?.[0] || formatEthereumAddress(address, 8);
                accountModal.openAccountModal?.();
                return enqueueErrorMessage(t`${addressName} is already connected.`);
            }

            const message = await FireflySocialMediaProvider.getMessageToSignForBindWallet(address.toLowerCase());
            const signature = await signMessageAsync({ message: { raw: message }, account: address });

            await FireflySocialMediaProvider.verifyAndBindWallet(message, signature);

            enqueueSuccessMessage(t`Wallet added successfully`);
            onSuccess?.();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to add wallet`), { error });
            throw error;
        }
    }, [
        account.isConnected,
        account.address,
        connections,
        connectModal.openConnectModal,
        accountModal.openAccountModal,
    ]);

    return (
        <ClickableButton
            {...rest}
            className="h-10 rounded-2xl bg-lightMain px-[18px] text-[15px] font-bold leading-10 text-lightBottom dark:text-darkBottom"
            onClick={handleAddWallet}
            disabled={loading || disabled}
        >
            {loading ? <Trans>Adding...</Trans> : <Trans>Add wallet</Trans>}
        </ClickableButton>
    );
});
