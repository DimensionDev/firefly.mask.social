import { t, Trans } from '@lingui/macro';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useSignMessage } from 'wagmi';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface AddWalletButtonProps extends Omit<ClickableButtonProps, 'children'> {
    onSuccess?: () => void;
}

export const AddWalletButton = memo<AddWalletButtonProps>(function AddWalletButton({
    disabled = false,
    onSuccess,
    ...rest
}) {
    const account = useAccount();
    const { signMessageAsync } = useSignMessage();
    const connectModal = useConnectModal();

    const [{ loading }, handleAddWallet] = useAsyncFn(async () => {
        try {
            const address = account.address;
            if (!account.isConnected || !address) {
                return connectModal.openConnectModal?.();
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
    }, [account.isConnected, account.address, connectModal.openConnectModal]);

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
