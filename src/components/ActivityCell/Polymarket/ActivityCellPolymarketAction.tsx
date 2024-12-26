'use client';

import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import type { PropsWithChildren } from 'react';

import BuyIcon from '@/assets/bet-buy.svg';
import SellIcon from '@/assets/bet-sell.svg';
import { ActivityCellAction } from '@/components/ActivityCell/ActivityCellAction.js';
import { ActivityCellActionTag } from '@/components/ActivityCell/ActivityCellActionTag.js';
import { PolymarketBetType } from '@/constants/enum.js';
import { formatAmount } from '@/helpers/polymarket.js';

export function ActivityCellPolymarketAction({
    type,
    children,
    usdcSize,
}: PropsWithChildren<{ type: PolymarketBetType; usdcSize: string }>) {
    switch (type) {
        case PolymarketBetType.Buy:
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<BuyIcon />}>
                        <Trans>Placed a bet</Trans>
                    </ActivityCellActionTag>
                    <Trans>
                        <span>worth ${formatAmount(usdcSize)} at Polymarket</span>
                    </Trans>
                    {children}
                </ActivityCellAction>
            );
        case PolymarketBetType.Sell:
            return (
                <ActivityCellAction>
                    <ActivityCellActionTag icon={<SellIcon />}>
                        <Trans>Sold a bet</Trans>
                    </ActivityCellActionTag>
                    <Trans>
                        <span>worth ${formatAmount(usdcSize)} at Polymarket</span>
                    </Trans>
                    {children}
                </ActivityCellAction>
            );
        default:
            safeUnreachable(type);
            return null;
    }
}
