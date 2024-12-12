import { Trans } from '@lingui/macro';
import { memo, useMemo } from 'react';

import SendIcon from '@/assets/send.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props {
    post: Post;
    canClaim: boolean;
    isClaimed: boolean;
    isEmpty: boolean;
    isExpired: boolean;
    canRefund: boolean;
    handleShare: () => void;
    handleRefund: () => void;
    refundLoading: boolean;
    balance: number | bigint;
    estimateLoading: boolean;
    payload: RedPacketJSONPayload;
    handleClaim: () => void;
}
export const RedpacketCardFooter = memo<Props>(function RedpacketCardFooter({
    post,
    canClaim,
    isClaimed,
    isEmpty,
    isExpired,
    canRefund,
    handleShare,
    handleRefund,
    refundLoading,
    balance,
    estimateLoading,
    handleClaim,
}) {
    const { currentProfile } = useProfileStore(post.source);
    const isLogin = useIsLogin();
    const { account } = useChainContext();

    const footer = useMemo(() => {
        if (!currentProfile)
            return (
                <ActionButton className="w-full">
                    <Trans>Connect to {resolveSourceName(post.source)}</Trans>
                </ActionButton>
            );
        if (!account && canClaim) {
            return (
                <ActionButton className="flex w-full items-center justify-center gap-1">
                    <WalletIcon width={16} height={14} />
                    <Trans>Connect Wallet</Trans>
                </ActionButton>
            );
        }

        if (isExpired && canRefund) {
            return (
                <ActionButton
                    className="flex w-full items-center justify-center"
                    onClick={handleRefund}
                    loading={refundLoading}
                >
                    <Trans>Refund</Trans>
                </ActionButton>
            );
        }

        if ((!canClaim || isClaimed || isEmpty || isExpired) && isLogin && !canRefund) {
            return (
                <ActionButton
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-x-1"
                    onClick={handleShare}
                >
                    <SendIcon width={16} height={16} />
                    <Trans>Share</Trans>
                </ActionButton>
            );
        }

        return (
            <div className="light flex gap-3">
                <ActionButton
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-x-1 text-sm leading-[18px]"
                    onClick={handleShare}
                >
                    <SendIcon width={16} height={16} />
                    <Trans>Share</Trans>
                </ActionButton>
                {balance > 0 ? (
                    <ActionButton
                        loading={estimateLoading}
                        onClick={handleClaim}
                        className="flex w-full items-center justify-center gap-x-1 text-sm leading-[18px]"
                    >
                        <WalletIcon width={16} height={14} />
                        <Trans>Claim Now</Trans>
                    </ActionButton>
                ) : (
                    <ActionButton
                        className="flex w-full items-center justify-center gap-x-1 text-sm leading-[18px]"
                        loading={estimateLoading}
                        disabled
                    >
                        <Trans>Insufficient Balance for Gas Fee</Trans>
                    </ActionButton>
                )}
            </div>
        );
    }, [
        account,
        balance,
        canClaim,
        canRefund,
        currentProfile,
        estimateLoading,
        handleRefund,
        handleShare,
        isClaimed,
        isEmpty,
        isExpired,
        isLogin,
        post.source,
        refundLoading,
        handleClaim,
    ]);

    return (
        <>
            <div className="light">{footer}</div>
        </>
    );
});
