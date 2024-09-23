import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';
import { type Address, isAddress } from 'viem';
import { useEnsAvatar, useEnsName } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { Avatar } from '@/components/Avatar.js';
import { CopyButton } from '@/components/CopyButton.js';
import { classNames } from '@/helpers/classNames.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Relationship } from '@/providers/types/Firefly.js';

interface WalletItemProps {
    relation: Relationship;
}

export const WalletItem = memo<WalletItemProps>(function WalletItem({ relation: { address, blocked } }) {
    const isMuted = blocked ?? false;
    const isValidAddress = isAddress(address) || isValidSolanaAddress(address);

    const isLogin = useIsLogin();
    const { data: ens, isLoading: ensLoading } = useEnsName({
        address: address as Address,
        query: { enabled: isValidAddress },
    });
    const { data: avatar, isLoading: avatarLoading } = useEnsAvatar({
        name: ens ?? undefined,
        query: { enabled: !!ens && isValidAddress },
    });

    const walletHandle = ens || formatAddress(address, 8);

    const mutation = useMutation({
        mutationFn: () => {
            if (isMuted) return FireflySocialMediaProvider.unblockWallet(address);
            return FireflySocialMediaProvider.blockWallet(address);
        },
    });

    const [{ loading }, onToggle] = useAsyncFn(async () => {
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        if (!isMuted) {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Mute ${walletHandle}`,
                variant: 'normal',
                content: (
                    <div className="text-main">
                        <Trans>Articles from {walletHandle} will now be hidden in your home timeline</Trans>
                    </div>
                ),
            });
            if (!confirmed) return;
        }
        await mutation.mutateAsync();
    }, [isLogin, isMuted, walletHandle, mutation.mutateAsync]);

    const isLoading = mutation.isPending || loading;

    return (
        <div className="mb-3 flex h-[72px] w-full items-center justify-start gap-2.5 border-b border-line text-medium text-lightMain md:p-3">
            {avatarLoading ? (
                <LoadingIcon className="animate-spin" width={48} height={48} />
            ) : (
                <Avatar src={avatar!} size={48} alt={ens || address || ''} />
            )}
            <div className="flex min-w-0 flex-1 flex-col truncate text-left">
                {ensLoading ? (
                    <LoadingIcon className="animate-spin" width={28} height={28} />
                ) : ens ? (
                    <span className="truncate text-lg font-bold">{walletHandle}</span>
                ) : null}
                <div
                    className={classNames(
                        'flex items-center',
                        ens ? 'text-lightSecond' : 'text-lg font-bold text-lightMain',
                    )}
                >
                    <span className="truncate">{formatAddress(address, 8)}</span>
                    <CopyButton value={address} />
                </div>
            </div>
            {isValidAddress ? (
                <ToggleMutedButton className="shrink-0" isMuted={isMuted} loading={isLoading} onClick={onToggle} />
            ) : null}
        </div>
    );
});
