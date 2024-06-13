import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
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
    const mutation = useMutation({
        mutationFn: () => {
            if (isFollowing) return FireflySocialMediaProvider.unwatchWallet(address);
            return FireflySocialMediaProvider.watchWallet(address);
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
            {isFollowing ? <EyeSlashIcon width={24} height={24} /> : <EyeIcon width={24} height={24} />}
            <span className="font-bold leading-[22px] text-main">
                {isFollowing ? <Trans>Unwatch {identity}</Trans> : <Trans>Watch {identity}</Trans>}
            </span>
        </MenuButton>
    );
});
