import { Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import { type ReactNode, useCallback, useMemo } from 'react';

import DiscordRoundIcon from '@/assets/discord-round.svg';
import WebsiteIcon from '@/assets/website.svg';
import { CountdownTimer } from '@/components/Calendar/CountdownTimer.js';
import { EmptyStatus } from '@/components/Calendar/EmptyStatus.js';
import { LoadingStatus } from '@/components/Calendar/LoadingStatus.js';
import { Image } from '@/components/Image.js';
import { CommunityLink } from '@/components/TokenProfile/CommunityLink.js';
import { Tooltip } from '@/components/Tooltip.js';
import { XIcon } from '@/components/XIcon.js';
import { TWITTER_PROFILE_REGEX } from '@/constants/regexp.js';
import { Link } from '@/esm/Link.js';
import { fixUrlProtocol } from '@/helpers/fixUrlProtocol.js';

interface NFTListProps {
    list: Record<string, any[]>;
    isLoading: boolean;
    date: Date;
}

const SocialIcons: Record<string, ReactNode> = {
    twitter: <XIcon width={20} height={20} />,
    discord: <DiscordRoundIcon width={20} height={20} />,
    website: <WebsiteIcon className="dark:invert" width={20} height={20} />,
};

const sortPlat = (_: any, b: { type: string }) => {
    if (b.type === 'website') return -1;
    else return 0;
};

export function NFTList({ list, isLoading, date }: NFTListProps) {
    const listAfterDate = useMemo(() => {
        return Object.keys(list).filter((key) => new Date(key) >= date);
    }, [list, date]);
    const empty = !listAfterDate.length;
    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 });
    }, []);
    return (
        <div
            className="no-scrollbar relative flex h-[506px] w-full flex-col gap-[10px] overflow-y-scroll"
            ref={listRef}
            key={date.toISOString()}
        >
            <div>
                {isLoading && empty ? (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 whitespace-nowrap text-second">
                        <LoadingStatus />
                    </div>
                ) : !empty && listAfterDate.length ? (
                    listAfterDate.map((key) => {
                        return (
                            <div className="text-sm" key={key}>
                                <p className="p-2 font-bold leading-none">
                                    {dayjs(new Date(key)).format('MMM DD, YYYY')}
                                </p>
                                {list[key].map((v) => (
                                    <div
                                        className="relative flex flex-col gap-2 border-b border-line p-2 outline-none last:border-none hover:no-underline"
                                        key={v.event_url}
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
                                                <Link
                                                    className="link-overlay text-sm font-bold text-main"
                                                    href={fixUrlProtocol(v.event_url)}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    {v.project.name}
                                                </Link>
                                            </div>
                                        </div>
                                        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                            {v.project.description}
                                        </p>
                                        <div className="flex w-full justify-between">
                                            <CountdownTimer targetDate={new Date(v.event_date)} />
                                            <div className="flex items-center gap-2">
                                                {v.project.links
                                                    .sort(sortPlat)
                                                    .map((platform: { type: string; url: string }) => {
                                                        const isTwitterProfile = TWITTER_PROFILE_REGEX.test(
                                                            platform.url,
                                                        );

                                                        return isTwitterProfile ? (
                                                            <CommunityLink
                                                                iconSize={20}
                                                                key={platform.type}
                                                                link={{ type: 'twitter', link: platform.url }}
                                                            />
                                                        ) : (
                                                            <Tooltip
                                                                content={platform.url}
                                                                placement="top"
                                                                key={platform.type}
                                                            >
                                                                <Link
                                                                    className="z-10 h-5 w-5"
                                                                    href={platform.url}
                                                                    rel="noopener noreferrer"
                                                                    target="_blank"
                                                                >
                                                                    {SocialIcons[platform.type]}
                                                                </Link>
                                                            </Tooltip>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <p className="text-second">
                                                <Trans>Total</Trans>
                                            </p>
                                            <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                                {Number(v.ext_info.nft_info.total).toLocaleString('en-US')}
                                            </p>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <p className="text-second">
                                                <Trans>Price</Trans>
                                            </p>
                                            <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                                {v.ext_info.nft_info.token}
                                            </p>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <p className="text-second">
                                                <Trans>Date</Trans>
                                            </p>
                                            <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-main">
                                                {dayjs(new Date(v.event_date)).format('MMM DD, YYYY HH:mm')}
                                            </p>
                                        </div>
                                        <Image
                                            className="h-[156px] w-full rounded-md object-cover"
                                            src={v.poster_url}
                                            width={450}
                                            height={150}
                                            alt="poster"
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <EmptyStatus>
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                )}
            </div>
        </div>
    );
}
