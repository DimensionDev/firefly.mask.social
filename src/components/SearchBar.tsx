'use client';

import { i18n } from '@lingui/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation.js';
import { type ChangeEvent, memo, useRef, useState } from 'react';

import CloseIcon from '@/assets/close-circle.svg';
import SearchIcon from '@/assets/search.svg';
import { SearchType } from '@/constants/enum.js';

export const SearchBar = memo(function SearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const dropdownRef = useRef(null);
    const [searchText, setSearchText] = useState('');

    // useOnClickOutside(dropdownRef, () => setSearchText(''));

    const handleSearch = (evt: ChangeEvent<HTMLInputElement>) => {
        const keyword = evt.target.value;
        setSearchText(keyword);
        // if (pathname !== '/search' && !hideDropdown) {
        //   searchUsers({
        //     variables: {
        //       request: {
        //         type: SearchRequestTypes.Profile,
        //         query: keyword,
        //         customFilters: [CustomFiltersTypes.Gardeners],
        //         limit: 8
        //       }
        //     }
        //   });
        // }
    };

    const handleKeyDown = (evt: ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (pathname === '/search') {
            router.push(`/search?q=${searchText}&type=${params.get('type') ?? SearchType.Profiles}`);
        } else {
            router.push(`/search?q=${searchText}&type=${SearchType.Profiles}`);
        }
        // setSearchText('');
    };

    if (pathname.startsWith('/settings')) return null;

    return (
        <div className="w-full overflow-y-auto px-4 py-4 sm:px-6 lg:block lg:px-8">
            <div className=" flex items-center rounded-xl bg-input px-3 text-main">
                <SearchIcon width={18} height={18} />
                <form className="w-full flex-1" onSubmit={handleKeyDown}>
                    <input
                        type="search"
                        name="search"
                        id="search"
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
