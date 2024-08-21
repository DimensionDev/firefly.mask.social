import { Trans } from '@lingui/macro';
import { switchChain } from '@wagmi/core';
import { memo, type PropsWithChildren } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { ActionButton } from '@/components/ActionButton.js';
import { config } from '@/configs/wagmiClient.js';
import { ConnectModalRef } from '@/modals/controls.js';

interface ChainBoundaryProps extends PropsWithChildren {
    targetChainId?: number;
    text?: string;
    buttonClassName?: string;
}

export const ChainBoundary = memo<ChainBoundaryProps>(function ChainBoundary({
    targetChainId,
    text,
    children,
    buttonClassName,
}) {
    const account = useAccount();

    const [{ loading }, handleSwitchChain] = useAsyncFn(async () => {
        if (!targetChainId) return;
        return switchChain(config, { chainId: targetChainId });
    }, [targetChainId]);

    if (!account.isConnected || !account.address) {
        return (
            <ActionButton
                onClick={() => {
                    ConnectModalRef.open();
                }}
                className={buttonClassName}
            >
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        );
    }

    if (targetChainId && account.chainId !== targetChainId) {
        return (
            <ActionButton className={buttonClassName} loading={loading} onClick={handleSwitchChain}>
                {text}
            </ActionButton>
        );
    }

    return children;
});
