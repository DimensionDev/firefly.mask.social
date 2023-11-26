'use client';

import { i18n } from '@lingui/core';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';

import { SearchType } from '@/constants/enum.js';

const Filters = [
    {
        type: SearchType.Posts,
        label: i18n.t('Publications'),
    },
    {
        type: SearchType.Profiles,
        label: i18n.t('Profiles'),
    },
];

interface SearchFilterProps {}

export const SearchFilter = memo(function SearchBar(props: SearchFilterProps) {
    const pathname = usePathname();

    if (!pathname.startsWith('/search')) return null;

    return (
        <div>
            <div className=" mb-6 rounded-xl bg-input px-3 py-2.5 text-sm font-bold">
                <h1>Search Filter</h1>
            </div>
            <div className=" mt-4 rounded-xl border border-line">
                <fieldset className=" px-4 pb-1 pt-2">
                    {Filters.map((filter) => (
                        <div key={filter.type} className="flex items-center">
                            <label
                                htmlFor={filter.type}
                                className=" block flex-1 py-2 text-sm font-bold leading-6 dark:text-white"
                            >
                                {filter.label}
                            </label>
                            <input
                                id={filter.type}
                                name="notification-method"
                                type="radio"
                                defaultChecked={filter.type === SearchType.Profiles}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                onClick={() => {
                                    // dispatch the action here
                                }}
                            />
                        </div>
                    ))}
                </fieldset>
            </div>
        </div>
    );
});
