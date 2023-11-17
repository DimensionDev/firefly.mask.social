'use client';
import dynamic from 'next/dynamic.js';

import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

const DynamicCalendar = dynamic(() => import('@masknet/plugin-calendar').then((x) => ({ default: x.RenderCalendar })), {
    ssr: false,
});

export const SearchBar = memo(function SearchBar() {
    const pathname = usePathname();

    if (pathname.includes('/settings')) return null;
    return (
        <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto border-l border-gray-200 px-4 py-6 sm:px-6 lg:block lg:px-8">
            <input
                type="search"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Search Lens handle or Farcaster"
            />
            <section className="mt-4">
                <DynamicCalendar />
            </section>
        </aside>
    );
});
