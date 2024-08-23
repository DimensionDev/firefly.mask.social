import { t } from '@lingui/macro';
import { useMutation } from '@tanstack/react-query';
import { memo, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { useIsWalletMuted } from '@/hooks/useIsWalletMuted.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

enum State {
    Mute = 'Mute',
    Unmute = 'Unmute',
    Muted = 'Muted',
}

interface ToggleMuteWalletButtonProps extends Omit<ClickableButtonProps, 'children'> {
    address: string;
}

export const ToggleMuteWalletButton = memo(function ToggleMuteWalletButton({
    address,
    className,
    ...rest
}: ToggleMuteWalletButtonProps) {
    const [hovering, setHovering] = useState(false);

    const { data: isMuted } = useIsWalletMuted(address);

    const mutation = useMutation({
        mutationFn: () => {
            if (isMuted) return FireflySocialMediaProvider.unblockWallet(address);
            return FireflySocialMediaProvider.blockWallet(address);
        },
    });
    const loading = mutation.isPending;

    const buttonText = isMuted ? (hovering && !loading ? t`Unmute` : t`Muted`) : t`Mute`;
    const buttonState = isMuted ? (hovering && !loading ? State.Unmute : State.Muted) : State.Mute;

    return (
        <ClickableButton
            className={classNames(
                'flex h-8 min-w-[100px] items-center justify-center rounded-full border-danger px-2 text-medium font-semibold transition-all',
                className,
                buttonState === State.Muted ? 'border' : '',
                buttonState === State.Unmute ? 'border border-danger border-opacity-50' : '',
                isMuted ? 'bg-danger text-white' : 'text-danger',
            )}
            {...rest}
            disabled={loading}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
                mutation.mutate();
            }}
        >
            {loading ? <LoadingIcon width={16} height={16} className="mr-2 animate-spin" /> : null}
            {buttonText}
        </ClickableButton>
    );
});
