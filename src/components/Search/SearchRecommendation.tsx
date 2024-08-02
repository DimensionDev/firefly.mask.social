'use client';

import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { first, uniqBy } from 'lodash-es';
import urlcat from 'urlcat';
import { useDebounce } from 'usehooks-ts';

import LoadingIcon from '@/assets/loading.svg';
import SearchIcon from '@/assets/search.svg';
import { Avatar } from '@/components/Avatar.js';
import { ClearButton } from '@/components/ClearButton.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { SearchType, Source } from '@/constants/enum.js';
import { MAX_RECOMMEND_PROFILE_SIZE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { getChannelUrl } from '@/helpers/getChannelUrl.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Channel, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import { type SearchState } from '@/store/useSearchStore.js';

interface SearchRecommendationProps {
    keyword: string;
    fullScreen?: boolean;
    onSearch?: (state: SearchState) => void;
    onSelect?: (result: Profile | Channel) => void;
    onClear?: () => void;
}

export function SearchRecommendation(props: SearchRecommendationProps) {
    const { keyword, fullScreen = false, onSearch, onSelect, onClear } = props;

    const debouncedKeyword = useDebounce(keyword, 300);

    const currentSource = useGlobalState.use.currentSource();

    const { records, addRecord, removeRecord, clearAll } = useSearchHistoryStateStore();

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['searchText', currentSource, debouncedKeyword],
        queryFn: async () => {
            // utilize the prefix number to maintain key order
            const queriers: Record<`${number}_${Source}`, Promise<Pageable<Profile, PageIndicator>>> = {
                [`0_${Source.Farcaster}`]: FarcasterSocialMediaProvider.searchProfiles(debouncedKeyword),
                [`1_${Source.Lens}`]: LensSocialMediaProvider.searchProfiles(debouncedKeyword),
            };
            const allSettled = await Promise.allSettled(Object.values(queriers));

            return {
                // Only the first 5 results are displayed
                indicator: createIndicator(),
                data: allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value.data.slice(0, 3) : [])),
            };
        },
        enabled: !!debouncedKeyword,
    });

    const { data: channel, isLoading: fetchChannelLoading } = useQuery({
        queryKey: ['searchText', debouncedKeyword],
        queryFn: async () => {
            const channels = await FarcasterSocialMediaProvider.searchChannels(debouncedKeyword);
            return first(channels.data);
        },
        enabled: !!debouncedKeyword,
    });

    const visible = (records.length && !keyword) || !!keyword || isLoading || (!!profiles?.data && !!keyword);
    if (!visible) return null;

    const containerClasses = classNames(
        'absolute inset-x-0 top-10 z-[1000] flex w-full flex-col overflow-hidden bg-white shadow-[0_4px_30px_0_rgba(0,0,0,0.10)] dark:border dark:border-line dark:bg-primaryBottom',
        {
            'mt-2 rounded-2xl': !fullScreen,
            'bottom-0 mt-3 h-[calc(100vh-40px)] border-none': fullScreen,
        },
    );

    if (keyword) {
        return (
            <div className={containerClasses}>
                <h2 className="p-3 pb-2 text-sm">
                    <Trans>Publications</Trans>
                </h2>
                <Link
                    className="flex cursor-pointer items-center px-4 py-4 text-left hover:bg-bg"
                    href={urlcat('/search', { q: keyword, type: SearchType.Posts })}
                    onClick={() =>
                        onSearch?.({
                            q: keyword,
                            type: SearchType.Posts,
                        })
                    }
                >
                    <SearchIcon width={18} height={18} className="shrink-0" />
                    <span className="ml-4 text-ellipsis">{keyword}</span>
                </Link>

                {fetchChannelLoading || channel ? (
                    <h2 className="border-t border-line p-3 pb-2 text-sm">
                        <Trans>Channels</Trans>
                    </h2>
                ) : null}

                {isLoading ? (
                    <div className="flex flex-col items-center space-y-2 px-4 pb-5 pt-2 text-center text-sm font-bold">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                        <div className="font-bold">
                            <Trans>Searching channel</Trans>
                        </div>
                    </div>
                ) : !channel ? (
                    <div className="space-y-2 px-4 py-4 text-center text-sm font-bold">
                        <div className="font-bold">
                            <Trans>No matching channel</Trans>
                        </div>
                    </div>
                ) : (
                    <div className="py-2" key={channel.id}>
                        <Link
                            className="block cursor-pointer space-y-2 px-4 py-2 text-center text-sm font-bold hover:bg-bg"
                            href={getChannelUrl(channel)}
                            onClick={() => onSelect?.(channel)}
                        >
                            <div className="flex flex-row items-center">
                                <Avatar
                                    className="mr-[10px] h-10 w-10 rounded-full"
                                    src={channel.imageUrl}
                                    size={40}
                                    alt={channel.name}
                                />

                                <div className="flex-1 text-left">
                                    <div className="flex">
                                        <span className="mr-1">{channel.name}</span>
                                        <SocialSourceIcon source={Source.Farcaster} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {isLoading || profiles?.data ? (
                    <>
                        {records.length ? <hr className="border-b border-t-0 border-line" /> : null}
                        <h2 className="p-3 pb-2 text-sm">
                            <Trans>Profiles</Trans>
                        </h2>
                    </>
                ) : null}

                {isLoading ? (
                    <div className="flex flex-col items-center space-y-2 px-4 pb-5 pt-2 text-center text-sm font-bold">
                        <LoadingIcon className="animate-spin" width={24} height={24} />
                        <div className="font-bold">
                            <Trans>Searching users</Trans>
                        </div>
                    </div>
                ) : profiles?.data.length === 0 ? (
                    <div className="space-y-2 px-4 py-4 text-center text-sm font-bold">
                        <div className="font-bold">
                            <Trans>No matching users</Trans>
                        </div>
                    </div>
                ) : profiles?.data.length ? (
                    <div className="py-2">
                        {uniqBy(profiles.data, (x) => x.handle)
                            .slice(0, MAX_RECOMMEND_PROFILE_SIZE)
                            .map((profile) => (
                                <Link
                                    className="block cursor-pointer space-y-2 px-4 py-2 text-center text-sm font-bold hover:bg-bg"
                                    key={profile.handle}
                                    href={getProfileUrl(profile)}
                                    onClick={() => onSelect?.(profile)}
                                >
                                    <div className="flex flex-row items-center">
                                        <Avatar
                                            className="mr-[10px] h-10 w-10 rounded-full"
                                            src={profile.pfp}
                                            size={40}
                                            alt={profile.displayName}
                                        />

                                        <div className="flex-1 text-left">
                                            <div className="flex">
                                                <span className="mr-1">{profile.displayName}</span>
                                                <SocialSourceIcon source={profile.source} />
                                            </div>
                                            <div className="font-normal text-secondary">@{profile.handle}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                ) : null}
            </div>
        );
    }

    if (!records.length) return null;
    return (
        <div className={containerClasses}>
            <h2 className="flex p-3 pb-2 text-sm">
                <span className="font-bold text-main">
                    <Trans>Recent</Trans>
                </span>
                <ClickableButton
                    className="ml-auto font-bold text-[#246BFD]"
                    onClick={() => {
                        clearAll();
                        onClear?.();
                    }}
                >
                    <Trans>Clear All</Trans>
                </ClickableButton>
            </h2>
            {records.length ? (
                <ul className="my-0">
                    {records.map((record) => (
                        <Link
                            className="flex cursor-pointer items-center text-ellipsis px-3 hover:bg-bg"
                            key={record}
                            href={urlcat('/search', { q: record })}
                            onClick={() => {
                                addRecord(record);
                                onSearch?.({ q: record });
                            }}
                        >
                            <SearchIcon width={18} height={18} className="shrink-0" />
                            <span className="color-main ml-4 text-ellipsis py-2">{record}</span>
                            <ClearButton
                                size={16}
                                className="ml-auto"
                                tooltip={t`Remove`}
                                onClick={() => {
                                    removeRecord(record);
                                }}
                            />
                        </Link>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
