/* eslint-disable @next/next/no-img-element */
import { type HTMLProps } from 'react';
import { useAsync } from 'react-use';

import { Loading } from '@/components/Loading.js';
import { fetch } from '@/helpers/fetch.js';
import { type RedPacketCoverOptions, useRedPacketCover } from '@/mask/plugins/red-packet/hooks/useRedPacketCover.js';
import { Image } from '@/components/Image.js';
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
