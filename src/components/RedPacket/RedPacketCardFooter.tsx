import { Trans } from '@lingui/macro';
import { memo } from 'react';

import SendIcon from '@/assets/send.svg';
import WalletIcon from '@/assets/wallet.svg';
import { ActionButton } from '@/components/ActionButton.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useProfileStore } from '@/hooks/useProfileStore.js';
import { ConnectModalRef, LoginModalRef } from '@/modals/controls.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props {
    post: Post;
    canClaim: boolean;
    isClaimed: boolean;
    isEmpty: boolean;
    isExpired: boolean;
    isClaiming: boolean;
    isRefunded: boolean;
    canRefund: boolean;
    handleShare: () => void;
    handleRefund: () => void;
    refundLoading: boolean;
    balance: number | bigint;
    estimateLoading: boolean;
    payload: RedPacketJSONPayload;
    onClaim: () => void;
}
export const RedPacketCardFooter = memo<Props>(function RedPacketCardFooter({
    post,
    canClaim,
    isClaimed,
    isEmpty,
    isExpired,
    isClaiming,
    isRefunded,
    canRefund,
    handleShare,
    handleRefund,
    refundLoading,
    balance,
    estimateLoading,
    onClaim,
}) {
    const { currentProfile } = useProfileStore(post.source);
    const isLogin = useIsLogin();
    const { account } = useChainContext();

    if (!currentProfile)
        return (
            <div className="light">
                <ActionButton className="w-full" onClick={() => LoginModalRef.open({ source: post.source })}>
                    <Trans>Connect to {resolveSourceName(post.source)}</Trans>
                </ActionButton>
            </div>
        );
    if (!account && canClaim) {
        return (
            <div className="light">
                <ActionButton
                    className="flex w-full items-center justify-center gap-1"
                    onClick={() => ConnectModalRef.open()}
                >
                    <WalletIcon width={16} height={14} />
                    <Trans>Connect Wallet</Trans>
                </ActionButton>
            </div>
        );
    }

    if (isExpired && canRefund) {
        return (
            <div className="light">
                <ActionButton
                    className="flex w-full items-center justify-center"
                    onClick={handleRefund}
                    loading={refundLoading}
                >
                    <Trans>Refund</Trans>
                </ActionButton>
            </div>
        );
    }

    if (isRefunded) return null;

    if ((!canClaim || isClaimed || isEmpty || isExpired) && isLogin && !canRefund) {
        return (
            <div className="light">
                <ActionButton
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-x-1"
                    onClick={handleShare}
                >
                    <SendIcon width={16} height={16} />
                    <Trans>Share</Trans>
                </ActionButton>
            </div>
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
                    loading={estimateLoading || isClaiming}
                    onClick={onClaim}
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
});
