import { Trans } from '@lingui/macro';
import { IconButton, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useMemo } from 'react';

import DiscordRoundIcon from '@/assets/discord-round.svg';
import WebsiteIcon from '@/assets/website.svg';
import { CountdownTimer } from '@/components/Calendar/CountdownTimer.js';
import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';
import { XIcon } from '@/components/XIcon.js';
import { classNames } from '@/helpers/classNames.js';

interface NFTListProps {
    list: Record<string, any[]>;
    isLoading: boolean;
    empty: boolean;
    date: Date;
}

const socialIcons: Record<string, ReactNode> = {
    twitter: <XIcon width={18} height={18} />,
    discord: <DiscordRoundIcon width={20} height={18} color="#000" />,
    website: <WebsiteIcon width={20} height={18} />,
};

const sortPlat = (_: any, b: { type: string }) => {
    if (b.type === 'website') return -1;
    else return 0;
};

export function NFTList({ list, isLoading, empty, date }: NFTListProps) {
    const listAfterDate = useMemo(() => {
        return Object.keys(list).filter((key) => new Date(key) >= date);
    }, [list, date]);
    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 });
    }, []);
    return (
        <div
            className="scrollbar-none relative mb-[50px] flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll"
            ref={listRef}
            key={date.toISOString()}
        >
            <div className="pr-3">
                {isLoading && !list?.length ? (
                    <div
                        className={classNames(
                            'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second',
                            'leading-18 overflow-hidden overflow-ellipsis whitespace-nowrap text-main',
                        )}
                    >
                        <LoadingStatus />
                    </div>
                ) : !empty && listAfterDate.length ? (
                    listAfterDate.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className="leading-18 py-[10px] font-bold text-main">
                                    {dayjs(new Date(key)).format('MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <Link
                                        key={v.event_url}
                                        className="leading-16 text-12 flex cursor-pointer flex-col gap-2 font-bold hover:no-underline"
                                        href={v.event_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <div className="flex w-full justify-between">
                                            <div className="flex items-center gap-2 text-main">
                                                <Image
                                                    src={v.project.logo}
                                                    className="overflow-hidden rounded-full"
                                                    width={24}
                                                    height={24}
                                                    alt={v.project.name}
                                                />
                                                <Typography className="text-12 leading-16 font-bold text-main">
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className="leading-18 overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                            {v.project.description}
                                        </Typography>
                                        <div className="flex w-full justify-between">
                                            <CountdownTimer targetDate={new Date(v.event_date)} />
                                            <div className="flex items-center gap-2">
                                                {v.project.links
                                                    .sort(sortPlat)
                                                    .map((platform: { type: string; url: string }) => {
                                                        return (
                                                            <IconButton
                                                                style={{ width: '20px', height: '20px' }}
                                                                key={platform.type}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(platform.url);
                                                                }}
                                                            >
                                                                {socialIcons[platform.type]}
                                                            </IconButton>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <Typography className="leading-18 text-second">
                                                <Trans>Total</Trans>
                                            </Typography>
                                            <Typography className="leading-18 overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                                {Number(v.ext_info.nft_info.total).toLocaleString('en-US')}
                                            </Typography>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <Typography className="leading-18 text-second">
                                                <Trans>Price</Trans>
                                            </Typography>
                                            <Typography className="leading-18 overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                                {v.ext_info.nft_info.token}
                                            </Typography>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <Typography className="leading-18 text-second">
                                                <Trans>Date</Trans>
                                            </Typography>
                                            <Typography className="leading-18 overflow-hidden overflow-ellipsis whitespace-nowrap font-normal text-main">
                                                {dayjs(new Date(v.event_date)).format('MMM dd, yyyy HH:mm')}
                                            </Typography>
                                        </div>
                                        <Image
                                            className="h-[156px] w-full rounded-md object-cover"
                                            src={v.poster_url}
                                            alt="poster"
                                        />
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}
