'use client';

import { Trans } from '@lingui/macro';
import { memo } from 'react';

import { Link } from '@/components/Link.js';
import { RadioButton } from '@/components/RadioButton.js';
import { SearchType } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE } from '@/constants/index.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { DraggablePopoverRef } from '@/modals/controls.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

export const SearchFilter = memo(function SearchFilter() {
    const { searchKeyword, searchType, source, updateSearchType } = useSearchStateStore();

    const currentSocialSource = narrowToSocialSource(source);

    return (
        <div className="gap-2">
            <h2 className="mt-[10px] box-border hidden h-[35px] items-center rounded-xl px-3 text-lg font-bold md:mb-4 md:flex md:bg-lightBg md:text-sm">
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
                                href={resolveSearchUrl(searchKeyword, filter.type, source)}
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
                                <span className="flex-1 py-2 text-medium font-bold leading-6 dark:text-white">
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
