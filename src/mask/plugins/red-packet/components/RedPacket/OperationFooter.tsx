import { t, Trans } from '@lingui/macro';
import { Icons } from '@masknet/icons';
import { ChainBoundary, SelectProviderModal, WalletConnectedBoundary } from '@masknet/shared';
import { NetworkPluginID } from '@masknet/shared-base';
import { ActionButton } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { useChainContext } from '@masknet/web3-hooks-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { Box, useTheme } from '@mui/material';
import type { MouseEventHandler } from 'react';

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            width: '100%',
            display: 'flex',
            gap: theme.spacing(2),
            justifyContent: 'center',
            '& button': {
                flexBasis: 'auto',
            },
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                flexDirection: 'column',
                gap: theme.spacing(1),
            },
        },
    };
});

interface OperationFooterProps {
    chainId?: ChainId;
    canClaim: boolean;
    canRefund: boolean;
    canShare?: boolean;
    /** Is claiming or checking claim status */
    isClaiming: boolean;
    isRefunding: boolean;
    onShare?(): void;
    onClaimOrRefund: () => void | Promise<void>;
}
export function OperationFooter({
    chainId,
    canClaim,
    canRefund,
    canShare = true,
    isClaiming,
    isRefunding,
    onShare,
    onClaimOrRefund,
}: OperationFooterProps) {
    const { classes } = useStyles();
    const { account, chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId });
    const theme = useTheme();

    function getObtainButton(onClick: MouseEventHandler<HTMLButtonElement>) {
        if (!account) {
            return (
                <ActionButton fullWidth onClick={() => SelectProviderModal.open()} variant="roundedDark">
                    <Trans>Connect Wallet</Trans>
                </ActionButton>
            );
        }
        if (!canClaim && !canRefund) return null;
        if (!currentChainId) {
            return (
                <ActionButton disabled fullWidth variant="roundedDark">
                    <Trans>Invalid Network</Trans>
                </ActionButton>
            );
        }
        const isLoading = isClaiming || isRefunding;

        return (
            <ActionButton
                sx={{
                    backgroundColor: theme.palette.maskColor.dark,
                    width: '100%',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: theme.palette.maskColor.dark,
                    },
                }}
                variant="roundedDark"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                onClick={onClick}
            >
                {canClaim ? (
                    isClaiming ? (
                        <Trans>Claiming...</Trans>
                    ) : (
                        <Trans>Claim</Trans>
                    )
                ) : isRefunding ? (
                    <Trans>Refunding</Trans>
                ) : (
                    <Trans>Refund</Trans>
                )}
            </ActionButton>
        );
    }

    return (
        <Box style={{ flex: 1, padding: 12 }}>
            <Box className={classes.footer}>
                {canRefund || !canShare ? null : (
                    <ActionButton
                        fullWidth
                        variant="roundedDark"
                        startIcon={<Icons.Shared size={18} />}
                        onClick={onShare}
                    >
                        <Trans>Share</Trans>
                    </ActionButton>
                )}

                {canClaim || canRefund || !account ? (
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={(chainId as ChainId) ?? ChainId.Mainnet}
                        ActionButtonPromiseProps={{ variant: 'roundedDark' }}
                    >
                        <WalletConnectedBoundary
                            noGasText={t`Insufficient Balance`}
                            hideRiskWarningConfirmed
                            expectedChainId={chainId ?? ChainId.Mainnet}
                            startIcon={<Icons.Wallet size={18} />}
                            ActionButtonProps={{ variant: 'roundedDark' }}
                        >
                            {getObtainButton(onClaimOrRefund)}
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                ) : null}
            </Box>
        </Box>
    );
}
