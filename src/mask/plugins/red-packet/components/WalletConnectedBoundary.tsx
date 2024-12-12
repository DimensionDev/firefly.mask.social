'use client';

import { Trans } from '@lingui/macro';

import { ActionButton, type ActionButtonProps } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { isZero } from '@/helpers/number.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useNativeTokenBalance } from '@/mask/bindings/hooks.js';

const useStyles = makeStyles()({
    button: {
        margin: 0,
    },
});

export interface WalletConnectedBoundaryProps extends withClasses<'connectWallet' | 'button'> {
    offChain?: boolean;
    children?: React.ReactNode;
    expectedChainId: number;
    ActionButtonProps?: ActionButtonProps;
    startIcon?: React.ReactNode;
    noGasText?: string;
    isIgnoreGasCheck?: boolean;
}

export function WalletConnectedBoundary(props: WalletConnectedBoundaryProps) {
    const { children = null, offChain = false, expectedChainId, noGasText, isIgnoreGasCheck = false } = props;

    const { classes, cx } = useStyles(undefined, { props });

    const { account, chainId: chainIdValid } = useChainContext({ chainId: expectedChainId });

    const nativeTokenBalance = useNativeTokenBalance(undefined, {
        chainId: chainIdValid,
    });

    const buttonClass = cx(classes.button, classes.connectWallet);

    if (!account)
        return (
            <ActionButton startIcon={props.startIcon} className={buttonClass} fullWidth {...props.ActionButtonProps}>
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        );

    if (!isIgnoreGasCheck && isZero(nativeTokenBalance.value ?? '0') && !offChain)
        return (
            <ActionButton
                className={buttonClass}
                disabled
                fullWidth
                variant="contained"
                onClick={nativeTokenBalance.retry}
                {...props.ActionButtonProps}
            >
                {nativeTokenBalance.loading ? (
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
