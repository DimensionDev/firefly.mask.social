'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation.js';
import { type ChangeEvent, memo, useRef, useState } from 'react';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import SearchIcon from '@/assets/search.svg';
import { Avatar } from '@/components/Avatar.js';
import { PlatformIcon } from '@/components/PlatformIcon.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

import { useSearchHistories } from './useSearchHistories.js';
import { useSearchState } from './useSearchState.js';

interface SearchBarProps {
    source: 'header' | 'secondary';
}

const SearchBar = memo(function SearchBar(props: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { currentSource: currentSocialPlatform } = useGlobalState();
    const inputRef = useRef<HTMLInputElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const isSearchPage = pathname === '/search';
    const { keyword: queryKeyword, updateParams } = useSearchState();
    const [inputText, setInputText] = useState(queryKeyword);
    const debouncedKeyword = useDebounce(inputText, 300);
    const { histories, addRecord, removeRecord, clearAll } = useSearchHistories();

    const rootRef = useRef(null);
    useOnClickOutside(rootRef, () => {
        setShowDropdown(false);
    });

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['searchText', currentSocialPlatform, debouncedKeyword],
        queryFn: async () => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.searchProfiles(debouncedKeyword);
                case SocialPlatform.Farcaster:
                    return HubbleSocialMediaProvider.searchProfiles(debouncedKeyword);
                default:
                    safeUnreachable(currentSocialPlatform);
                    return;
            }
        },
        enabled: !isSearchPage && Boolean(debouncedKeyword),
    });

    const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
        setInputText(evt.target.value);
    };

    const selectKeyword = (keyword: string, searchType?: SearchType) => {
        addRecord(keyword);

        updateParams({ q: keyword, type: searchType });
        setShowDropdown(false);
    };

    if (props.source === 'header' && !isSearchPage) return null;
    if (props.source === 'secondary' && isSearchPage) return null;

    return (
        <div
            className={classNames('flex items-center px-4 pt-6', {
                'pb-5 pl-0 pr-0': props.source === 'secondary',
            })}
            ref={rootRef}
        >
            {isSearchPage && props.source === 'header' ? (
                <LeftArrowIcon width={24} height={24} className="mr-7 cursor-pointer" onClick={() => router.back()} />
            ) : null}
            <div className="relative flex flex-grow items-center rounded-xl bg-lightBg px-3 text-main">
                <SearchIcon width={18} height={18} className="shrink-0" />
                <form
                    className="w-full flex-1"
                    onSubmit={(evt) => {
                        evt.preventDefault();
                        selectKeyword(inputText);
                    }}
                >
                    <label className="flex w-full items-center" htmlFor="search">
                        <input
                            type="search"
                            name="searchText"
                            autoComplete="off"
                            value={inputText}
                            className=" w-full border-0 bg-transparent py-2 text-[10px] placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder={t`Search…`}
                            ref={inputRef}
                            onChange={handleInputChange}
                            onFocus={() => setShowDropdown(true)}
                        />
                        <CloseIcon
                            className={classNames('cursor-pointer', inputText ? 'visible' : 'invisible')}
                            width={16}
                            height={16}
                            onClick={(evt) => {
                                evt.preventDefault();
                                evt.stopPropagation();
                                setInputText('');
                                inputRef.current?.focus();
                            }}
                        />
                    </label>
                </form>
                {showDropdown ? (
                    <div className="absolute inset-x-0 top-[40px] z-[1000] mt-2 flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_30px_0_rgba(0,0,0,0.10)] dark:bg-primaryBottom">
                        {histories.length && !inputText ? (
                            <>
                                <h2 className=" flex p-3 pb-2 text-sm">
                                    <Trans>Recent</Trans>
                                    <button
                                        className="ml-auto font-bold text-[#246BFD]"
                                        onClick={() => {
                                            clearAll();
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </h2>
                                <ul className="my-4">
                                    {histories.map((history) => (
                                        <li
                                            key={history}
                                            className="flex cursor-pointer items-center text-ellipsis px-4 hover:bg-bg"
                                            onClick={() => {
                                                selectKeyword(history);
                                            }}
                                        >
                                            <SearchIcon width={18} height={18} className="shrink-0" />
                                            <span className="color-main ml-4 text-ellipsis py-2">{history}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeRecord(history);
                                                }}
                                                className="ml-auto"
                                            >
                                                <CloseIcon width={16} height={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : null}

                        {inputText ? (
                            <>
                                <h2 className=" p-3 pb-2 text-sm">
                                    {currentSocialPlatform === SocialPlatform.Lens ? (
                                        <Trans>Publications</Trans>
                                    ) : currentSocialPlatform === SocialPlatform.Farcaster ? (
                                        <Trans>Casts</Trans>
                                    ) : (
                                        <Trans>Posts</Trans>
                                    )}
                                </h2>

                                <div
                                    className=" flex cursor-pointer items-center px-4 py-4 text-left hover:bg-bg"
                                    onClick={() => selectKeyword(inputText, SearchType.Posts)}
                                >
                                    <SearchIcon width={18} height={18} className="shrink-0" />
                                    <span className=" ml-4 text-ellipsis">{inputText}</span>
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
                                <div className="text-bold">{t`Searching users`}</div>
                            </div>
                        ) : profiles?.data.length === 0 ? (
                            <div className="space-y-2 px-4 py-4 text-center text-sm font-bold">
                                <div className="text-bold">{t`No matching users`}</div>
                            </div>
                        ) : profiles?.data.length ? (
                            <div className="cursor-pointer py-2">
                                {profiles.data.slice(0, 10).map((profile) => (
                                    <div
                                        key={profile.handle}
                                        className="space-y-2 px-4 py-2 text-center text-sm font-bold hover:bg-bg"
                                        onClick={(evt) => {
                                            router.push(getProfileUrl(profile));
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
                                                    <PlatformIcon source={profile.source} />
                                                </div>
                                                <div className=" font-normal text-secondary">@{profile.handle}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
});

export function HeaderSearchBar() {
    const pathname = usePathname();
    const isSearchPage = pathname === '/search';
    return isSearchPage ? <SearchBar source="header" /> : null;
}

export function AsideSearchBar() {
    const pathname = usePathname();
    const isSearchPage = pathname !== '/search';
    return isSearchPage ? <SearchBar source="secondary" /> : null;
}
