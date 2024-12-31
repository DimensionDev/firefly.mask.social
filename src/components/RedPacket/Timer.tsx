'use client';

import { t, Trans } from '@lingui/macro';
import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import localFont from 'next/font/local';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import urlcat from 'urlcat';
import { useInterval } from 'usehooks-ts';
import type { Address } from 'viem';

import HourGlassIcon from '@/assets/hourglass.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Loading } from '@/components/Loading.js';
import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { RedPacketCardFooter } from '@/components/RedPacket/RedPacketCardFooter.js';
import { RequirementsModal } from '@/components/RedPacket/RequirementsModal.js';
import { useVerifyAndClaim } from '@/components/RedPacket/useVerifyAndClaim.js';
import { SITE_URL } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { createPublicViemClient } from '@/helpers/createPublicViemClient.js';
import { fetch } from '@/helpers/fetch.js';
import { getTimeLeft } from '@/helpers/formatTimestamp.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { minus, ZERO } from '@/helpers/number.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useAvailableBalance } from '@/hooks/useAvailableBalance.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useRefundCallback } from '@/hooks/useRefundCallback.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { useAvailabilityComputed } from '@/mask/plugins/red-packet/hooks/useAvailabilityComputed.js';
import { useRedPacketCover } from '@/mask/plugins/red-packet/hooks/useRedPacketCover.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { type RedPacketJSONPayload, RedPacketStatus } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { TokenType } from '@/types/rp.js';

export function Timer({ endTime }: { endTime: number }) {
    const [now, setNow] = useState(Date.now());

    const timeLeft = getTimeLeft(endTime, now);
    const isExpired = dayjs(now).isAfter(endTime);

    useInterval(
        () => {
            setNow(Date.now());
        },
        !isExpired ? 1000 : null,
    );
    if (isExpired || !timeLeft) return null;
    return (
        <div className="flex items-center justify-center gap-[6px] text-nowrap rounded-full bg-[#E8E8FF] px-[13px] py-[7px] opacity-75 backdrop-blur-[5px]">
            <HourGlassIcon width={12} height={12} />
            <span className="flex-1 text-xs leading-4">
                <Trans>
                    {timeLeft.hours}h: {timeLeft.minutes}m: {timeLeft.seconds}s
                </Trans>
            </span>
        </div>
    );
}
