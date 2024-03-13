'use client';

import { t, Trans } from '@lingui/macro';
import { createIndicator, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import { useDebounce } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import LoadingIcon from '@/assets/loading.svg';
import SearchIcon from '@/assets/search.svg';
import { Avatar } from '@/components/Avatar.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { MAX_RECOMMEND_PROFILE_SIZE } from '@/constants/index.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchHistoryStateStore } from '@/store/useSearchHistoryStore.js';
import type { SearchState } from '@/store/useSearchState.js';

interface SearchRecommendationProps {
    keyword: string;
    onSearch?: (state: SearchState) => void;
    onSelect?: (profile: Profile) => void;
    onClear?: () => void;
}

export function SearchRecommendation(props: SearchRecommendationProps) {
    const { keyword, onSearch, onSelect, onClear } = props;

    const router = useRouter();
    const debouncedKeyword = useDebounce(keyword, 300);
    const { currentSource } = useGlobalState();
    const { records, removeRecord, clearAll } = useSearchHistoryStateStore();

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['searchText', currentSource, debouncedKeyword],
        queryFn: async () => {
            // utilize the prefix number to maintain key order
            const queriers: Record<`${number}_${SocialPlatform}`, Promise<Pageable<Profile, PageIndicator>>> = {
                [`0_${SocialPlatform.Farcaster}`]: FarcasterSocialMediaProvider.searchProfiles(debouncedKeyword),
                [`1_${SocialPlatform.Lens}`]: LensSocialMediaProvider.searchProfiles(debouncedKeyword),
            };
            const allSettled = await Promise.allSettled(Object.values(queriers));

            return {
                // Only the first 5 results are displayed
                indicator: createIndicator(),
                data: allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value.data.slice(0, 5) : [])),
            };
        },
        enabled: !!debouncedKeyword,
    });

    const visible = (records.length && !keyword) || !!keyword || isLoading || !!profiles?.data;
    if (!visible) return null;

    return (
        <>
            {records.length && !keyword ? (
                <>
                    <h2 className=" flex p-3 pb-2 text-sm">
                        <Trans>Recent</Trans>
                        <button
                            className="ml-auto font-bold text-[#246BFD]"
                            onClick={() => {
                                clearAll();
                                onClear?.();
                            }}
                        >
                            <Trans>Clear All</Trans>
                        </button>
                    </h2>
                    {records.length ? (
                        <ul className="my-4">
                            {records.map((record) => (
                                <li
                                    key={record}
                                    className="flex cursor-pointer items-center text-ellipsis px-4 hover:bg-bg"
                                    onClick={() => {
                                        onSearch?.({ q: record });
                                    }}
                                >
                                    <SearchIcon width={18} height={18} className="shrink-0" />
                                    <span className="color-main ml-4 text-ellipsis py-2">{record}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeRecord(record);
                                        }}
                                        className="ml-auto"
                                    >
                                        <CloseIcon width={16} height={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </>
            ) : null}

            {keyword ? (
                <>
                    <h2 className=" p-3 pb-2 text-sm">
                        <Trans>Publications</Trans>
                    </h2>

                    <div
                        className=" flex cursor-pointer items-center px-4 py-4 text-left hover:bg-bg"
                        onClick={() =>
                            onSearch?.({
                                type: SearchType.Posts,
                                q: keyword,
                            })
                        }
                    >
                        <SearchIcon width={18} height={18} className="shrink-0" />
                        <span className=" ml-4 text-ellipsis">{keyword}</span>
                    </div>
                </>
            ) : null}

            {isLoading || profiles?.data ? (
                <>
                    <hr className=" border-b border-t-0 border-line" />
                    <h2 className=" p-3 pb-2 text-sm">
                        <Trans>Profiles</Trans>
                    </h2>
                </>
            ) : null}

            {isLoading ? (
                <div className="flex flex-col items-center space-y-2 px-4 pb-5 pt-2 text-center text-sm font-bold">
                    <LoadingIcon className="animate-spin" width={24} height={24} />
                    <div className="font-bold">{t`Searching users`}</div>
                </div>
            ) : profiles?.data.length === 0 ? (
                <div className="space-y-2 px-4 py-4 text-center text-sm font-bold">
                    <div className="font-bold">{t`No matching users`}</div>
                </div>
            ) : profiles?.data.length ? (
                <div className="py-2">
                    {profiles.data.slice(0, MAX_RECOMMEND_PROFILE_SIZE).map((profile) => (
                        <div
                            className="cursor-pointer space-y-2 px-4 py-2 text-center text-sm font-bold hover:bg-bg "
                            key={profile.handle}
                            onClick={() => {
                                router.push(getProfileUrl(profile));
                                onSelect?.(profile);
                            }}
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
                                        <SourceIcon source={profile.source} />
                                    </div>
                                    <div className=" font-normal text-secondary">@{profile.handle}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </>
    );
}
