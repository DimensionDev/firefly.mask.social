import { Trans } from '@lingui/macro';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import FollowIcon from '@/assets/follow-user.svg';
import UnfollowIcon from '@/assets/unfollow-user.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useIsFollowingWallet } from '@/hooks/useIsFollowingWallet.js';
import { useToggleWatchWallet } from '@/hooks/useToggleWatchWallet.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    handleOrEnsOrAddress: string;
    address: Address;
    isFollowing?: boolean;
}

export const WatchWalletButton = forwardRef<HTMLButtonElement, Props>(function WatchWalletButton(
    { handleOrEnsOrAddress, address, isFollowing, ...rest }: Props,
    ref,
) {
    const { data } = useIsFollowingWallet(address, isFollowing === undefined);
    const following = isFollowing || data;

    const mutation = useToggleWatchWallet({ handleOrEnsOrAddress, address, following: !!following });

    return (
        <MenuButton
            {...rest}
            onClick={async (event) => {
                await mutation.mutateAsync();
                rest.onClick?.(event);
            }}
            ref={ref}
        >
            {following ? <UnfollowIcon width={18} height={18} /> : <FollowIcon width={18} height={18} />}
            <span className="font-bold leading-[22px] text-main">
                {following ? (
                    <Trans>Unwatch {handleOrEnsOrAddress}</Trans>
                ) : (
                    <Trans>Watch {handleOrEnsOrAddress}</Trans>
                )}
            </span>
        </MenuButton>
    );
});
