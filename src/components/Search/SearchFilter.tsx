'use client';

import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { SearchType } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE } from '@/constants/index.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

export const SearchFilter = memo(function SearchFilter() {
    const { currentSource } = useGlobalState();
    const { searchType, updateState } = useSearchStateStore();

    return (
        <div>
            <h2 className=" hidden rounded-xl px-3 py-2.5 text-lg font-bold md:my-6 md:block md:bg-lightBg md:text-sm">
                <Trans>Search Filter</Trans>
            </h2>
            <div className=" rounded-xl md:my-4 md:border md:border-line">
                <fieldset className=" pr-1 md:px-4 md:pb-1 md:pt-2">
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
                        .filter((x) => SORTED_SEARCH_TYPE[currentSource].includes(x.type))
                        .map((filter) => (
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
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-transparent"
                                    onClick={() => {
                                        updateState({ type: filter.type });

                                        // in mobile view, close the popover after selecting a filter
                                        DraggablePopoverRef.close();
                                    }}
                                />
                            </div>
                        ))}
                </fieldset>
            </div>
        </div>
    );
});
