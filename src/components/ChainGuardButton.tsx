import { Trans } from '@lingui/macro';
import { switchChain } from '@wagmi/core';
import { memo, type MouseEvent } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { ActionButton, type ActionButtonProps } from '@/components/ActionButton.js';
import { config } from '@/configs/wagmiClient.js';
import { ConnectModalRef } from '@/modals/controls.js';

interface ChainGuardButtonProps extends ActionButtonProps {
    targetChainId?: number;
}

export const ChainGuardButton = memo<ChainGuardButtonProps>(function ChainBoundary({
    targetChainId,
    children,
    onClick,
    ...props
}) {
    const account = useAccount();

    const [{ loading }, handleClick] = useAsyncFn(
        async (event: MouseEvent<HTMLButtonElement>) => {
            if (targetChainId && account.chainId !== targetChainId) {
                await switchChain(config, { chainId: targetChainId });
            }

            return onClick?.(event);
        },
        [targetChainId, onClick],
    );

    if (!account.isConnected || !account.address) {
        return (
            <ActionButton
                {...props}
                disabled={false}
                onClick={() => {
                    ConnectModalRef.open();
                }}
            >
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        );
    }

    return (
        <ActionButton {...props} loading={loading || props.loading} onClick={handleClick}>
            {children}
        </ActionButton>
    );
});
