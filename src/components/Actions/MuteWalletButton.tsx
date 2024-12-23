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
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { captureMuteEvent } from '@/providers/telemetry/captureMuteEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    handleOrEnsOrAddress: string;
    address: Address;
    isMuted?: boolean;
}

export const MuteWalletButton = forwardRef<HTMLButtonElement, Props>(function MuteArticleButton(
    { handleOrEnsOrAddress, address, isMuted, onClick, ...rest }: Props,
    ref,
) {
    const isLogin = useIsLogin();
    const mutation = useMutation({
        mutationFn: async () => {
            if (isMuted) {
                const result = await FireflyEndpointProvider.unblockWallet(address);
                captureMuteEvent(EventId.UNMUTE_SUCCESS, address);
                enqueueSuccessMessage(t`Muted ${handleOrEnsOrAddress}.`);
                return result;
            } else {
                const result = await FireflyEndpointProvider.blockWallet(address);
                enqueueSuccessMessage(t`Unmuted ${handleOrEnsOrAddress}.`);
                captureMuteEvent(EventId.MUTE_SUCCESS, address);
                return result;
            }
        },
    });
    return (
        <MenuButton
            {...rest}
            onClick={async (event) => {
                onClick?.(event);

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
            {mutation.isPending ? (
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
