import { t } from '@lingui/macro';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { memo, useCallback } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { resolveTokenTransfer } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import { useTipsValidation } from '@/hooks/useTipsValidation.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';

interface SendTipsButtonProps {
    connected: boolean;
    onConnect: () => void;
}

const SendTipsButton = memo<SendTipsButtonProps>(function SendTipsButton({ connected, onConnect }) {
    const { token, receiver, amount, update } = TipsContext.useContainer();
    const { value, loading: isValidating, error } = useTipsValidation();

    const [{ loading: isSending }, handleSendTips] = useAsyncFn(async () => {
        if (!connected) {
            onConnect();
            return;
        }
        try {
            if (!receiver || !token) return;
            const { chainId, id } = token;
            const transfer = resolveTokenTransfer(receiver.blockchain);
            const hash = await transfer.transfer({
                to: receiver.address,
                token,
                amount,
            });
            const hashUrl = transfer.getTransactionUrl(chainId, hash) ?? transfer.getAddressUrl(chainId, id);
            if (hashUrl) {
                update((prev) => ({ ...prev, hash: hashUrl }));
            }
            router.navigate({ to: TipsRoutePath.SUCCESS });
        } catch (error) {
            enqueueErrorMessage(error instanceof Error ? error.message : t`Failed to send tips`, { error });
        }
    }, [connected, receiver, token, amount]);

    return (
        <ClickableButton
            className="mt-6 flex h-10 w-full items-center justify-center rounded-[20px] bg-lightMain text-lightBottom dark:text-darkBottom"
            disabled={!connected ? false : isValidating || isSending || !!value?.disabled || !!error}
            onClick={handleSendTips}
        >
            {!connected ? (
                t`Connect Wallet`
            ) : isSending || isValidating ? (
                <LoadingIcon className="animate-spin" width={24} height={24} />
            ) : error ? (
                t`Validate failed, please check your input`
            ) : (
                value?.label
            )}
        </ClickableButton>
    );
});

export function SendWithEVM() {
    const account = useAccount();
    const onConnect = useCallback(() => {
        ConnectWalletModalRef.open();
    }, []);

    return <SendTipsButton connected={account.isConnected} onConnect={onConnect} />;
}

export function SendWithSolana() {
    const wallet = useWallet();
    const walletModal = useWalletModal();

    const onConnect = useCallback(() => {
        walletModal.setVisible(true);
    }, [walletModal]);

    return <SendTipsButton connected={!!wallet.publicKey} onConnect={onConnect} />;
}
