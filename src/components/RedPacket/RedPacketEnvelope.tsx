/* eslint-disable @next/next/no-img-element */
import { type HTMLProps } from 'react';
import { useAsync } from 'react-use';

import { Loading } from '@/components/Loading.js';
import { fetch } from '@/helpers/fetch.js';
import { type RedPacketCoverOptions, useRedPacketCover } from '@/mask/plugins/red-packet/hooks/useRedPacketCover.js';

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

    const { loading: imageLoading } = useAsync(async () => {
        if (!cover?.url) return;
        await fetch(cover.url);
    }, [cover?.url]);

    return (
        <div className="h-full" {...rest}>
            {isLoadingCover || imageLoading ? (
                <Loading className="flex !h-full !min-h-[auto] w-full items-center justify-center" />
            ) : cover ? (
                <img alt="cover" key={cover.url} className="h-full w-full object-cover" src={cover.url} />
            ) : null}
        </div>
    );
}
