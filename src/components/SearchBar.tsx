'use client';

import { i18n } from '@lingui/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { type ChangeEvent, memo, useEffect, useRef, useState } from 'react';
import { useDebounce, useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close-circle.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
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
    const { updateSearchText } = useSearchStore();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);

    useOnClickOutside(dropdownRef, () => setSearchText(''));

    useEffect(() => {
        const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : undefined;
        setSearchText(params?.get('q') ?? '');
    }, [pathname]);

    const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const searchText = evt.target.value;
        setSearchText(searchText);

        // implement the fetch profiles data for dropdown
        // use debouncedSearchText here
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

    if (isSettingsPage) return null;
    if (props.source === 'header' && !isSearchPage) return null;
    if (props.source === 'secondary' && isSearchPage) return null;

    return (
        <div className=" mt-5 flex items-center rounded-xl bg-input px-3 text-main">
            <SearchIcon width={18} height={18} />
            <form className="w-full flex-1" onSubmit={handleSubmit}>
                <label className="flex w-full items-center" htmlFor="search">
                    <input
                        type="search"
                        name="search"
                        id="search"
                        value={searchText}
                        className=" w-full border-0 bg-transparent py-2 text-[10px] placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder={i18n.t('Search…')}
                        onChange={handleInputChange}
                    />
                    <CloseIcon
                        className={classNames('cursor-pointer', searchText ? 'visible' : 'invisible')}
                        width={16}
                        height={16}
                        onClick={() => setSearchText('')}
                    />
                </label>
            </form>
        </div>
    );
});
