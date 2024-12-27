import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';
import { isAddress } from 'viem';

import { ToggleMutedButton } from '@/components/Actions/ToggleMutedButton.js';
import { Avatar } from '@/components/Avatar.js';
import { CopyTextButton } from '@/components/CopyTextButton.js';
import { Link } from '@/components/Link.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { isValidSolanaAddress } from '@/helpers/isValidSolanaAddress.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';

interface WalletItemProps {
    profile: WalletProfile;
}

export const WalletItem = memo<WalletItemProps>(function WalletItem({
    profile: { address, primary_ens, avatar: ensAvatar, blocked },
}) {
    const isMuted = blocked ?? false;
    const isValidAddress = isAddress(address) || isValidSolanaAddress(address);

    const profileLink = resolveProfileUrl(Source.Wallet, address);
    const walletHandle = primary_ens || formatAddress(address, 10, 0);
    const avatar = ensAvatar || getStampAvatarByProfileId(Source.Wallet, address);

    const isLogin = useIsLogin();
    const mutation = useMutation({
        mutationFn: () => {
            if (isMuted) return FireflyEndpointProvider.unblockWallet(address);
            return FireflyEndpointProvider.blockWallet(address);
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

        enqueueSuccessMessage(isMuted ? t`Unmuted ${walletHandle}.` : t`Muted ${walletHandle}.`);
    }, [isLogin, isMuted, walletHandle, mutation.mutateAsync]);

    const isLoading = mutation.isPending || loading;

    return (
        <div className="mb-3 flex h-[72px] w-full items-center justify-start gap-2.5 border-b border-line text-medium text-lightMain md:p-3">
            <Link href={profileLink}>
                <Avatar src={avatar} size={48} alt={walletHandle} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col truncate text-left">
                {primary_ens ? (
                    <Link href={profileLink} className="truncate text-lg font-bold">
                        {walletHandle}
                    </Link>
                ) : null}
                <div
                    className={classNames(
                        'flex items-center',
                        primary_ens ? 'text-lightSecond' : 'text-lg font-bold text-lightMain',
                    )}
                >
                    <Link href={profileLink} className="truncate">
                        {formatAddress(address, 10, 0)}
                    </Link>
                    <CopyTextButton text={address} />
                </div>
            </div>
            {isValidAddress ? (
                <ToggleMutedButton className="shrink-0" isMuted={isMuted} loading={isLoading} onClick={onToggle} />
            ) : null}
        </div>
    );
});
