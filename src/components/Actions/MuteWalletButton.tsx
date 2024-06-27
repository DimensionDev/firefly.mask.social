import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import MuteIcon from '@/assets/mute.svg';
import UnmuteIcon from '@/assets/unmute.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    identity: string;
    address: Address;
    isMuted?: boolean;
}

export const MuteWalletButton = forwardRef<HTMLButtonElement, Props>(function MuteArticleButton(
    { identity, address, isMuted, ...rest }: Props,
    ref,
) {
    const mutation = useMutation({
        mutationFn: () => {
            if (isMuted) return FireflySocialMediaProvider.unblockWallet(address);
            return FireflySocialMediaProvider.blockWallet(address);
        },
    });
    const loading = mutation.isPending;
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                if (!isMuted) {
                    const confirmed = await ConfirmModalRef.openAndWaitForClose({
                        title: t`Mute ${identity}`,
                        variant: 'normal',
                        content: (
                            <div className="text-main">
                                <Trans>Articles from @{identity} will now be hidden in your home timeline</Trans>
                            </div>
                        ),
                    });
                    if (!confirmed) {
                        rest.onClick?.();
                        return;
                    }
                }
                await mutation.mutateAsync();
            }}
            ref={ref}
        >
            {loading ? (
                <LoadingIcon width={18} height={18} className="mx-1 animate-spin" />
            ) : isMuted ? (
                <UnmuteIcon width={18} height={18} />
            ) : (
                <MuteIcon width={18} height={18} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {isMuted ? <Trans>Unmute {identity}</Trans> : <Trans>Mute {identity}</Trans>}
            </span>
        </MenuButton>
    );
});
