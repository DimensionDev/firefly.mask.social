'use client';

import { i18n } from '@lingui/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { type ChangeEvent, memo, useRef, useState } from 'react';

import CloseIcon from '@/assets/close-circle.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchType } from '@/constants/enum.js';
import { useOnClickOutside } from '@/hooks/useOnClickOutside.js';

export const SearchBar = memo(function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const dropdownRef = useRef(null);
    const [searchText, setSearchText] = useState('');

    useOnClickOutside(dropdownRef, () => setSearchText(''));

    const handleSearch = (evt: ChangeEvent<HTMLInputElement>) => {
        const keyword = evt.target.value;
        setSearchText(keyword);

        // implement the fetch data here
    };

    const handleKeyDown = (evt: ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (pathname === '/search') {
            router.push(`/search?q=${searchText}&type=${params.get('type') ?? SearchType.Profiles}`);
        } else {
            router.push(`/search?q=${searchText}&type=${SearchType.Profiles}`);
        }
        setSearchText('');
    };

    if (pathname.startsWith('/settings') || pathname.startsWith('/search')) return null;

    return (
        <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto px-4 py-6 sm:px-6 lg:block lg:px-8">
            <div className=" flex items-center rounded-xl bg-input px-3 text-main">
                <SearchIcon width={18} height={18} />
                <form className="w-full flex-1" onSubmit={handleKeyDown}>
                    <input
                        type="search"
                        name="searchBarInput"
                        id="searchBarInput"
                        value={searchText}
                        className=" w-full border-0 bg-transparent py-2 text-[10px] placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder={i18n.t('Search…')}
                        onChange={handleSearch}
                    />
                </form>
                <CloseIcon width={16} height={16} />
            </div>
        </aside>
    );
});
