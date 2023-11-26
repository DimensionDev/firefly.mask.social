'use client';
import { i18n } from '@lingui/core';
import dynamic from 'next/dynamic.js';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import SearchIcon from '@/assets/search.svg';

// @ts-ignore
const DynamicCalendar = dynamic(() => import('@masknet/plugin-calendar').then((x) => ({ default: x.RenderCalendar })), {
    ssr: false,
});

export const SearchBar = memo(function SearchBar() {
    const pathname = usePathname();

    if (pathname.includes('/settings')) return null;
    return (
        <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto border-l border-line px-4 py-6 sm:px-6 lg:block lg:px-8">
            <div className=" flex items-center rounded-xl bg-input px-3 text-main">
                <SearchIcon width={18} height={18} />
                <input
                    type="search"
                    name="search"
                    id="search"
                    className="w-full border-0 bg-transparent py-1.5 placeholder-secondary shadow-sm focus:border-0 focus:outline-0 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder={i18n.t('Search Lens handle or Farcaster')}
                />
            </div>
        </aside>
    );
});
