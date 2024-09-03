import { t, Trans } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { forwardRef } from 'react';
import type { Address } from 'viem';

import LoadingIcon from '@/assets/loading.svg';
import MuteIcon from '@/assets/mute.svg';
import UnmuteIcon from '@/assets/unmute.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    handleOrEnsOrAddress: string;
    address: Address;
    isMuted?: boolean;
}

export const MuteWalletButton = forwardRef<HTMLButtonElement, Props>(function MuteArticleButton(
    { handleOrEnsOrAddress, address, isMuted, ...rest }: Props,
    ref,
) {
    const isLogin = useIsLogin();
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
                if (!isLogin) {
                    LoginModalRef.open();
                    return;
                }
                if (!isMuted) {
                    const confirmed = await ConfirmModalRef.openAndWaitForClose({
                        title: t`Mute ${handleOrEnsOrAddress}`,
                        variant: 'normal',
                        content: (
                            <div className="text-main">
                                <Trans>
                                    Articles from {handleOrEnsOrAddress} will now be hidden in your home timeline
                                </Trans>
                            </div>
                        ),
                    });
                    if (!confirmed) return;
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
                {isMuted ? <Trans>Unmute {handleOrEnsOrAddress}</Trans> : <Trans>Mute {handleOrEnsOrAddress}</Trans>}
            </span>
        </MenuButton>
    );
});
