/* eslint-disable @next/next/no-img-element */
import { type HTMLProps } from 'react';

import { Image } from '@/components/Image.js';
import { type RedPacketCoverOptions, useRedPacketCover } from '@/components/RedPacket/hooks/useRedPacketCover.js';

interface Props extends HTMLProps<HTMLDivElement>, RedPacketCoverOptions {}

export function RedPacketEnvelope({
    rpid,
    themeId,
    token,
    shares,
    total,
    sender,
    message,
    claimedAmount,
    claimed,
    type,
    usage,
    ...rest
}: Props) {
    const { data: cover, isLoading: isLoadingCover } = useRedPacketCover({
        rpid,
        themeId,
        token,
        shares,
        total,
        sender,
        message,
        claimedAmount,
        claimed,
        type,
        usage,
    });

    return (
        <div className="h-full w-full" {...rest}>
            {cover ? <Image alt="cover" width={220} height={154} src={cover?.url} /> : null}
        </div>
    );
}
