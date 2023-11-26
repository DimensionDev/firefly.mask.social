'use client';

import { i18n } from '@lingui/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { type ChangeEvent, memo, useEffect, useRef } from 'react';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStore } from '@/store/useSearchStore.js';

interface SearchBarProps {
    source: 'header' | 'secondary';
}

export const SearchBar = memo(function SearchBar(props: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const isSearchPage = pathname.startsWith('/search');
    const isSettingsPage = pathname.startsWith('/settings');

    const dropdownRef = useRef(null);
    const { searchText, searchType, updateSearchText, resetSearchText } = useSearchStore();
    const { currentSocialPlatform } = useGlobalState();
    const debouncedSearchText = useDebounce(searchText, 500);

    useOnClickOutside(dropdownRef, () => updateSearchText(''));

    useEffect(() => {
        resetSearchText();
    }, [pathname, resetSearchText]);

    const handleSearch = (evt: ChangeEvent<HTMLInputElement>) => {
        const searchText = evt.target.value;
        updateSearchText(searchText);

        // implement the fetch data here
        // use debouncedSearchText here
    };

    const handleKeyDown = (evt: ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();

        if (isSearchPage) {
            router.push(`/search?q=${searchText}&type=${params.get('type') ?? SearchType.Profiles}`);
        } else {
            router.push(`/search?q=${searchText}&type=${SearchType.Profiles}`);
        }
        updateSearchText('');
    };

    if (isSettingsPage) return null;
    if (props.source === 'header' && !isSearchPage) return null;
    if (props.source === 'secondary' && isSearchPage) return null;

    return (
        <div className=" flex items-center rounded-xl bg-input px-3 text-main">
            <SearchIcon width={18} height={18} />
            <form className="w-full flex-1" onSubmit={handleKeyDown}>
                <label className="flex w-full items-center" htmlFor="search">
                    <input
                        type="search"
                        name="search"
                        id="search"
                        value={searchText}
                        className=" w-full border-0 bg-transparent py-2 text-[10px] placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder={i18n.t('Search…')}
                        onChange={handleSearch}
                    />
                    <CloseIcon
                        className={classNames('cursor-pointer', searchText ? 'visible' : 'invisible')}
                        width={16}
                        height={16}
                        onClick={() => updateSearchText('')}
                    />
                </label>
            </form>
        </div>
    );
});
