import { t } from '@lingui/macro';
import { ActionButton } from '@/mask/bindings/components.js';
import { makeStyles } from '@/mask/bindings/index.js';
import type { ChainId } from '@masknet/web3-shared-evm';
import { type Theme, useMediaQuery } from '@mui/material';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { CompositionTypeContext } from '@/mask/plugins/red-packet/components/RedPacketInjection.js';
import { RedPacketMetaKey } from '@/mask/plugins/red-packet/constants.js';
import { openComposition } from '@/mask/plugins/red-packet/helpers/openComposition.js';
import { useRefundCallback } from '@/mask/plugins/red-packet/hooks/useRefundCallback.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`;
    return {
        actionButton: {
            fontSize: 12,
            width: 88,
            height: 32,
            background: `${theme.palette.maskColor.dark} !important`,
            opacity: '1 !important',
            color: theme.palette.maskColor.white,
            borderRadius: '999px',
            minHeight: 'auto',
            [smallQuery]: {
                marginTop: theme.spacing(1),
            },
            '&:disabled': {
                background: theme.palette.maskColor.primaryMain,
                color: theme.palette.common.white,
            },
            '&:hover': {
                background: theme.palette.maskColor.dark,
                color: theme.palette.maskColor.white,
                opacity: 0.8,
            },
        },
    };
});

interface TokenInfo {
    symbol: string;
    decimals: number;
    amount?: string;
}
interface Props {
    rpid: string;
    account: string;
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus;
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[];
    shareFrom?: string;
    themeId?: string;
    tokenInfo: TokenInfo;
    redpacketMsg?: string;
    chainId: ChainId;
    totalAmount?: string;
    createdAt?: number;
}

export const RedPacketActionButton = memo(function RedPacketActionButton(props: Props) {
    const {
        redpacketStatus: _redpacketStatus,
        rpid,
        account,
        claim_strategy,
        shareFrom,
        themeId,
        tokenInfo,
        redpacketMsg,
        chainId,
        totalAmount,
        createdAt,
    } = props;
    const [updatedStatus, setUpdatedStatus] = useState<FireflyRedPacketAPI.RedPacketStatus>();
    const { classes, cx } = useStyles();
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const compositionType = useContext(CompositionTypeContext);

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId);
    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: t`Send`,
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: t`Expired`,
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: t`Empty`,
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: t`Expired`,
        [FireflyRedPacketAPI.RedPacketStatus.View]: t`View`,
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: t`Refund`,
    };

    const [{ loading: isSharing }, shareCallback] = useAsyncFn(async () => {
        if (!shareFrom || !themeId || !createdAt) return;

        const payloadImage = await FireflyRedPacket.getPayloadUrlByThemeId(
            themeId,
            shareFrom,
            tokenInfo.amount,
            'fungible',
            tokenInfo.symbol,
            Number(tokenInfo.decimals),
        );
        openComposition(
            RedPacketMetaKey,
            {
                contract_version: 4,
                sender: {
                    address: account,
                    name: shareFrom,
                    message: redpacketMsg,
                },
                creation_time: createdAt * 1000,
                token: {
                    chainId,
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                },
                contract_address: rpid,
                rpid,
                shares: totalAmount,
                total: tokenInfo.amount,
            },
            compositionType,
            { claimRequirements: claim_strategy, payloadImage },
        );
    }, []);

    const redpacketStatus = updatedStatus || _redpacketStatus;

    const handleClick = useCallback(async () => {
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Send) await shareCallback();
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refunding) await refundCallback();
    }, [redpacketStatus, shareCallback, refundCallback]);

    useEffect(() => {
        if (refunded) setUpdatedStatus(FireflyRedPacketAPI.RedPacketStatus.Refund);
    }, [refunded]);

    return (
        <ActionButton
            loading={isRefunding || isSharing}
            fullWidth={isSmall}
            onClick={() => {
                handleClick();
            }}
            className={cx(classes.actionButton)}
            disabled={
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Empty ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Expired ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refund
            }
            size="large"
        >
            <span>{statusToTransMap[redpacketStatus]}</span>
        </ActionButton>
    );
});
