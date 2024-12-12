import { t, Trans } from '@lingui/macro';
import { ChainBoundary } from '@masknet/shared';
import { ChainId } from '@masknet/web3-shared-evm';
import { Box, useTheme } from '@mui/material';
import type { MouseEventHandler } from 'react';

import { NetworkPluginID } from '@/constants/enum.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { ActionButton, Icons } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import { useCheckSponsorableGasFee } from '@/mask/plugins/red-packet/hooks/useCheckSponsorableGasFee.js';

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
    isClaiming,
    isRefunding,
    onShare,
    onClaimOrRefund,
}: OperationFooterProps) {
    const { classes } = useStyles();
    const { account, chainId: currentChainId } = useChainContext({ chainId });
    const theme = useTheme();

    function getObtainButton(onClick: MouseEventHandler<HTMLButtonElement>) {
        if (!account) {
            return (
                <ActionButton
                    fullWidth
                    onClick={() => {
                        throw new Error('Not implemented');
                    }}
                    variant="roundedDark"
                >
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

    const { data: isSponsorable = false } = useCheckSponsorableGasFee(chainId ?? ChainId.Mainnet, account);

    return (
        <Box style={{ flex: 1, padding: 12 }}>
            <Box className={classes.footer}>
                {canRefund ? null : (
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
                            expectedChainId={chainId ?? ChainId.Mainnet}
                            startIcon={<Icons.Wallet size={18} />}
                            ActionButtonProps={{ variant: 'roundedDark' }}
                            isIgnoreGasCheck={isSponsorable}
                        >
                            {getObtainButton(onClaimOrRefund)}
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                ) : null}
            </Box>
        </Box>
    );
}
