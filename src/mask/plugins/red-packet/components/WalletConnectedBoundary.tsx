'use client';

import { Trans } from '@lingui/macro';
import type { ChainId } from '@masknet/web3-shared-evm';
import { useBalance } from 'wagmi';

import { useChainContext } from '@/hooks/useChainContext.js';
import { ActionButton, type ActionButtonProps } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';

const useStyles = makeStyles()({
    button: {
        margin: 0,
    },
});

export interface WalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'button'> {
    offChain?: boolean;
    children?: React.ReactNode;
    expectedChainId: ChainId;
    ActionButtonProps?: ActionButtonProps;
    startIcon?: React.ReactNode;
    noGasText?: string;
    isIgnoreGasCheck?: boolean;
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, expectedChainId, noGasText, isIgnoreGasCheck = false } = props;

    const { classes, cx } = useStyles(undefined, { props });

    const { account, chainId: chainIdValid } = useChainContext({ chainId: expectedChainId });

    const nativeTokenBalance = useBalance({
        chainId: chainIdValid,
    });

    const buttonClass = cx(classes.button, classes.connectWallet);

    if (!account)
        return (
            <ActionButton startIcon={props.startIcon} className={buttonClass} fullWidth {...props.ActionButtonProps}>
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        );

    if (!isIgnoreGasCheck && !(nativeTokenBalance.data?.value ?? 0n) && !offChain)
        return (
            <ActionButton
                className={buttonClass}
                disabled
                fullWidth
                variant="contained"
                onClick={async () => {
                    await nativeTokenBalance.refetch();
                }}
                {...props.ActionButtonProps}
            >
                {nativeTokenBalance.isLoading ? (
                    <Trans>Updating Gas Fee…</Trans>
                ) : (
                    (noGasText ?? <Trans>No Enough Gas Fe</Trans>)
                )}
            </ActionButton>
        );

    if (!chainIdValid && !offChain)
        return (
            <ActionButton className={buttonClass} disabled fullWidth variant="contained" {...props.ActionButtonProps}>
                <Trans>Invalid Network</Trans>
            </ActionButton>
        );

    return <>{children}</>;
}
