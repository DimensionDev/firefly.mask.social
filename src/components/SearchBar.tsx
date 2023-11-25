'use client';
import { i18n } from '@lingui/core';

import { memo } from 'react';
import SearchIcon from '@/assets/search.svg';
import CloseIcon from '@/assets/close.svg';
import { usePathname, useSearchParams } from 'next/navigation.js';

export const SearchBar = memo(function SearchBar() {
    const pathname = usePathname();
    const params = useSearchParams();

    if (!pathname.startsWith('/search')) return null;

    console.log('DEBUG: search bar');
    console.log({
        pathname,
    });

    return (
        <div className="w-full overflow-y-auto px-4 py-4 sm:px-6 lg:block lg:px-8">
            <div className=" flex items-center rounded-xl bg-input px-3 text-main">
                <SearchIcon width={18} height={18} />
                <input
                    type="search"
                    name="searchBar"
                    id="searchBar"
                    value={params.get('q') ?? ''}
                    className="w-full flex-1 appearance-none border-0 bg-transparent py-1.5 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder={i18n.t('Search Lens handle or Farcaster')}
                />
                <CloseIcon className="scale-75" width={24} height={24} />
            </div>
        </div>
    );
});
