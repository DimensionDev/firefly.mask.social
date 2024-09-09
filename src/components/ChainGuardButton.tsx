import { Trans } from '@lingui/macro';
import { switchChain } from '@wagmi/core';
import { memo } from 'react';
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
    ...props
}) {
    const account = useAccount();

    const [{ loading }, handleSwitchChain] = useAsyncFn(async () => {
        if (!targetChainId) return;
        return switchChain(config, { chainId: targetChainId });
    }, [targetChainId]);

    if (!account.isConnected || !account.address) {
        return (
            <ActionButton
                {...props}
                onClick={() => {
                    ConnectModalRef.open();
                }}
            >
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        );
    }

    if (targetChainId && account.chainId !== targetChainId) {
        return (
            <ActionButton {...props} loading={loading} onClick={handleSwitchChain}>
                {children}
            </ActionButton>
        );
    }

    return <ActionButton {...props}>{children}</ActionButton>;
});
