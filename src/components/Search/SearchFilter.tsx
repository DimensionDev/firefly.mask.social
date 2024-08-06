'use client';

import { Trans } from '@lingui/macro';
import { memo } from 'react';
import urlcat from 'urlcat';

import { RadioButton } from '@/components/RadioButton.js';
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

    const { searchKeyword, searchType, updateSearchType } = useSearchStateStore();

    return (
        <div className="gap-2">
            <h2 className="mt-[10px] box-border hidden h-[35px] items-center rounded-xl px-3 text-[15px] font-bold md:mb-4 md:flex md:bg-lightBg md:text-sm">
                <Trans>Search Filter</Trans>
            </h2>
            <div className="rounded-xl md:mt-4 md:border md:border-line md:bg-lightBg">
                <div className="pr-1 md:px-4 md:pb-1">
                    {[
                        {
                            type: SearchType.Posts,
                            label: <Trans>Publications</Trans>,
                        },
                        {
                            type: SearchType.Profiles,
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
                                href={urlcat('/search', { q: searchKeyword, type: filter.type })}
                                onClick={(event) => {
                                    if (!searchKeyword) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        updateSearchType(filter.type);
                                    }
                                    // in mobile view, close the popover after selecting a filter
                                    DraggablePopoverRef.close();
                                }}
                            >
                                <span className="flex-1 py-2 text-[15px] font-bold leading-6 dark:text-white">
                                    {filter.label}
                                </span>

                                <RadioButton size={18} checked={filter.type === searchType} />
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
});
