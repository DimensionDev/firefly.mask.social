import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { useIsFollowingWallet } from '@/hooks/useIsFollowingWallet.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    identity: string;
    address: Address;
    isFollowing?: boolean;
}

export const WatchWalletButton = forwardRef<HTMLButtonElement, Props>(function WatchWalletButton(
    { identity, address, isFollowing, ...rest }: Props,
    ref,
) {
    const { data } = useIsFollowingWallet(address, isFollowing === undefined);
    const following = isFollowing || data;

    const mutation = useMutation({
        mutationFn: async () => {
            try {
                if (following) {
                    const result = await FireflySocialMediaProvider.unwatchWallet(address);
                    enqueueSuccessMessage(t`${identity} unwatched`);
                    return result;
                }
                const result = await FireflySocialMediaProvider.watchWallet(address);
                enqueueSuccessMessage(t`${identity} watched`);
                return result;
            } catch (error) {
                enqueueErrorMessage(following ? t`Failed to unwatch ${identity}` : t`Failed to watch ${identity}`, {
                    error,
                });
                throw error;
            }
        },
    });

    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                await mutation.mutateAsync();
                rest.onClick?.();
            }}
            ref={ref}
        >
            {following ? <EyeSlashIcon width={24} height={24} /> : <EyeIcon width={24} height={24} />}
            <span className="font-bold leading-[22px] text-main">
                {following ? <Trans>Unwatch {identity}</Trans> : <Trans>Watch {identity}</Trans>}
            </span>
        </MenuButton>
    );
});
