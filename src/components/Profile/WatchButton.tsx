import { t } from '@lingui/macro';
import { useEverSeen } from '@masknet/shared-base-ui';
import { formatEthereumAddress } from '@masknet/web3-shared-evm';
import { memo, useState } from 'react';
import type { Address } from 'viem';
import { useEnsName } from 'wagmi';

import FollowIcon from '@/assets/follow-bold.svg';
import FollowedIcon from '@/assets/followed.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsFollowingWallet } from '@/hooks/useIsFollowingWallet.js';
import { useToggleWatchWallet } from '@/hooks/useToggleWatchWallet.js';

enum State {
    Watch = 'Watch',
    Unwatch = 'Unwatch',
    Watching = 'Following',
}

interface WatchButtonProps extends Omit<ClickableButtonProps, 'children'> {
    address: Address;
    variant?: 'text' | 'icon';
}

export const WatchButton = memo(function WatchButton({
    variant = 'text',
    address,
    className,
    ...rest
}: WatchButtonProps) {
    const [seen, ref] = useEverSeen<HTMLButtonElement>();
    const [hovering, setHovering] = useState(false);
    const { data: ens } = useEnsName({ address });
    const { data: isFollowing } = useIsFollowingWallet(address, seen);
    const identity = ens || formatEthereumAddress(address, 4);
    const mutation = useToggleWatchWallet({ identity, address, following: !!isFollowing });

    const loading = mutation.isPending;
    const buttonText = {
        text: isFollowing ? (hovering && !loading ? t`Unwatch` : t`Watching`) : t`Watch`,
        icon: isFollowing ? <FollowedIcon className="h-4 w-4" /> : <FollowIcon className="h-4 w-4" />,
    }[variant];
    const variantClassName = {
        text: 'min-w-[100px] px-2',
        icon: 'w-8 max-w-8',
    }[variant];
    const buttonState = isFollowing ? (hovering && !loading ? State.Unwatch : State.Watching) : State.Watch;

    return (
        <ClickableButton
            className={classNames(
                'flex h-8 items-center justify-center rounded-full text-[15px] font-semibold transition-all',
                variantClassName,
                className,
                {
                    'bg-main text-primaryBottom hover:opacity-80': buttonState === State.Watch,
                    'border-[1.5px] border-lightMain text-lightMain': buttonState === State.Watching,
                    'border-[1.5px] border-danger border-opacity-50 bg-danger bg-opacity-20 text-danger':
                        buttonState === State.Unwatch,
                },
            )}
            {...rest}
            ref={ref}
            disabled={loading}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
                mutation.mutate();
            }}
        >
            {buttonText}
        </ClickableButton>
    );
});
