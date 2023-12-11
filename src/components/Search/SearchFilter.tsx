'use client';

import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { SearchType } from '@/constants/enum.js';

import { useSearchState } from './useSearchState.js';

const Filters = [
    {
        type: SearchType.Posts,
        label: <Trans>Publications</Trans>,
    },
    {
        type: SearchType.Profiles,
        label: <Trans>Profiles</Trans>,
    },
];

export const SearchFilter = memo(function SearchFilter() {
    const { searchType, updateParams } = useSearchState();

    return (
        <div>
            <div className=" my-6 rounded-xl bg-lightBg px-3 py-2.5 text-sm font-bold">
                <h2>
                    <Trans>Search Filter</Trans>
                </h2>
            </div>
            <div className=" my-4 rounded-xl border border-line">
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
                                defaultChecked={filter.type === searchType}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                onClick={() => updateParams({ type: filter.type })}
                            />
                        </div>
                    ))}
                </fieldset>
            </div>
        </div>
    );
});
