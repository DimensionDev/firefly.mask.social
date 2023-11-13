'use client';

import { usePathname } from 'next/navigation';
import { memo } from 'react';

export const SearchBar = memo(function SearchBar() {
    const pathname = usePathname();

    if (pathname.includes('/settings')) return null;
    return (
        <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto border-l border-gray-200 px-4 py-6 sm:px-6 lg:px-8 lg:block">
            <input
                type="search"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Search Lens handle or Farcaster"
            />
        </aside>
    );
});
