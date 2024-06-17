import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useIsFollowingWallet } from '@/hooks/useIsFollowingWallet.js';
import { useToggleWatchWallet } from '@/hooks/useToggleWatchWallet.js';

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

    const mutation = useToggleWatchWallet({ identity, address, following: !!following });

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
