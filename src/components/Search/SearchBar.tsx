'use client';

import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { type ChangeEvent, memo, useEffect, useRef, useState } from 'react';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import LeftArrowIcon from '@/assets/left-arrow.svg';
import LoadingIcon from '@/assets/loading.svg';
import SearchIcon from '@/assets/search.svg';
import { Image } from '@/components/Image.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStore } from '@/store/useSearchStore.js';

interface SearchBarProps {
    source: 'header' | 'secondary';
}

const SearchBar = memo(function SearchBar(props: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const { isDarkMode } = useDarkMode();
    const { currentSocialPlatform } = useGlobalState();

    const isSearchPage = pathname === '/search';

    const dropdownRef = useRef(null);
    const { updateSearchText } = useSearchStore();
    const queryKeyword = params.get('q') || '';
    const [searchText, setSearchText] = useState(queryKeyword);
    const debouncedSearchText = useDebounce(searchText, 500);

    useOnClickOutside(dropdownRef, () => setSearchText(''));

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['searchText', debouncedSearchText, currentSocialPlatform],
        queryFn: async () => {
            switch (currentSocialPlatform) {
                case SocialPlatform.Lens:
                    return LensSocialMediaProvider.searchProfiles(debouncedSearchText);
                case SocialPlatform.Farcaster:
                    return HubbleSocialMediaProvider.searchProfiles(debouncedSearchText);
                default:
                    return;
            }
        },
        enabled: !isSearchPage && Boolean(debouncedSearchText),
    });

    useEffect(() => {
        if (isSearchPage) {
            updateSearchText(queryKeyword);
        }
    }, [queryKeyword, isSearchPage, updateSearchText]);

    const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const searchText = evt.target.value;
        setSearchText(searchText);
    };

    const handleSubmit = (evt: ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();

        if (isSearchPage) {
            router.push(`/search?q=${searchText}&type=${params.get('type') ?? SearchType.Profiles}`);
        } else {
            router.push(`/search?q=${searchText}&type=${SearchType.Profiles}`);
        }

        // submit the final search text
        updateSearchText(searchText);
    };

    if (props.source === 'header' && !isSearchPage) return null;
    if (props.source === 'secondary' && isSearchPage) return null;

    return (
        <div
            className={classNames('flex items-center px-4 pt-6', {
                'pl-0': props.source === 'secondary',
                'pr-0': props.source === 'secondary',
                'pb-5': props.source === 'secondary',
            })}
        >
            {isSearchPage && props.source === 'header' ? (
                <LeftArrowIcon width={24} height={24} className="mr-7 cursor-pointer" onClick={() => router.back()} />
            ) : null}
            <div className="relative flex flex-grow items-center rounded-xl bg-lightBg px-3 text-main">
                <SearchIcon width={18} height={18} />
                <form className="w-full flex-1" onSubmit={handleSubmit}>
                    <label className="flex w-full items-center" htmlFor="search">
                        <input
                            type="search"
                            name="searchText"
                            autoComplete="off"
                            value={searchText}
                            className=" w-full border-0 bg-transparent py-2 text-[10px] placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder={t`Search…`}
                            onChange={handleInputChange}
                        />
                        <CloseIcon
                            className={classNames('cursor-pointer', searchText ? 'visible' : 'invisible')}
                            width={16}
                            height={16}
                            onClick={(evt) => {
                                evt.preventDefault();
                                evt.stopPropagation();
                                setSearchText('');
                            }}
                        />
                    </label>
                </form>
                {!isSearchPage && searchText.length > 0 ? (
                    <div
                        className="bg-wite absolute inset-x-0 top-[40px] z-[1000] mt-2 flex w-full flex-col dark:bg-black"
                        ref={dropdownRef}
                    >
                        <div className=" rounded-2xl bg-lightBg">
                            <h2 className=" p-3 pb-2 text-xs">
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
                                // @ts-ignore
                                onClick={handleSubmit}
                            >
                                <SearchIcon className=" ml-1" width={18} height={18} />
                                <span className=" ml-5">{searchText}</span>
                            </div>

                            {isLoading || profiles?.data ? (
                                <>
                                    <hr className=" border-b border-t-0 border-line" />
                                    <h2 className=" p-3 pb-2 text-xs">
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
                                    {profiles.data.slice(0, 10).map((user) => (
                                        <div
                                            key={user.handle}
                                            className="space-y-2 px-4 py-2 text-center text-sm font-bold hover:bg-bg"
                                            onClick={(evt) => {
                                                router.push(`/profile/${user.handle}`);
                                                setSearchText('');
                                            }}
                                        >
                                            <div className="flex flex-row items-center">
                                                <Image
                                                    className="mr-[10px] h-10 w-10 rounded-full"
                                                    loading="lazy"
                                                    src={user.pfp}
                                                    fallback={
                                                        isDarkMode
                                                            ? '/image/firefly-dark-avatar.png'
                                                            : '/image/firefly-light-avatar.png'
                                                    }
                                                    width={40}
                                                    height={40}
                                                    alt={user.displayName}
                                                />
                                                <div className="flex-1 text-left">
                                                    <div className="flex">
                                                        <span className="mr-1">{user.displayName}</span>
                                                        <SourceIcon source={user.source} />
                                                    </div>
                                                    <div className=" font-normal text-secondary">@{user.handle}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
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
