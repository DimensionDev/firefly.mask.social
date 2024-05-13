'use client';

import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { SearchType } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

export const SearchFilter = memo(function SearchFilter() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const { searchKeyword, searchType } = useSearchStateStore();

    return (
        <div>
            <h2 className=" hidden rounded-xl px-3 py-2.5 text-lg font-bold md:my-6 md:block md:bg-lightBg md:text-sm">
                <Trans>Search Filter</Trans>
            </h2>
            <div className=" rounded-xl md:mt-4 md:border md:border-line">
                <div className=" pr-1 md:px-4 md:pb-1 md:pt-2">
                    {[
                        {
                            type: SearchType.Posts,
                            label: <Trans>Publications</Trans>,
                        },
                        {
                            type: SearchType.Users,
                            label: <Trans>Users</Trans>,
                        },
                        {
                            type: SearchType.Channels,
                            label: <Trans>Channels</Trans>,
                        },
                    ]
                        .filter((x) => SORTED_SEARCH_TYPE[currentSocialSource].includes(x.type))
                        .map((filter) => (
                            <Link
                                key={filter.type}
                                className="flex cursor-pointer items-center text-sm"
                                href={`/search?q=${searchKeyword}&type=${filter.type}`}
                            >
                                <span className=" flex-1 py-2 font-bold leading-6 dark:text-white">{filter.label}</span>
                                <input
                                    type="radio"
                                    checked={filter.type === searchType}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-transparent"
                                    onChange={() => {
                                        // in mobile view, close the popover after selecting a filter
                                        DraggablePopoverRef.close();
                                    }}
                                />
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
});
