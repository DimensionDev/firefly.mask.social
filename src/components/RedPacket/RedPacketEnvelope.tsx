/* eslint-disable @next/next/no-img-element */
import { type HTMLProps } from 'react';

import { Loading } from '@/components/Loading.js';
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

    return (
        <div
            style={
                cover
                    ? {
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundImage: `url(${cover.backgroundImageUrl})`,
                          backgroundColor: cover.backgroundColor,
                          aspectRatio: '10 / 7',
                      }
                    : undefined
            }
            {...rest}
        >
            {isLoadingCover ? (
                <Loading className="min-h-auto h-full w-full" />
            ) : cover ? (
                <img alt="cover" key={cover.url} className="h-full w-full object-cover" src={cover.url} />
            ) : null}
        </div>
    );
}
