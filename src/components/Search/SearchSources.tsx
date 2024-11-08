'use client';

import { memo, useMemo } from 'react';

import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { SearchType, Source } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';

interface SearchSourcesProps {
    query: string;
    source: Source;
    searchType: SearchType;
}

export const SearchSources = memo<SearchSourcesProps>(function SearchSources({
    query,
    source: selectedSource,
    searchType,
}) {
    const isTwitterLoggedIn = useIsLogin(Source.Twitter);

    const sources = useMemo(() => {
        return SORTED_SOCIAL_SOURCES.filter((x) => {
            if (x === Source.Twitter && !isTwitterLoggedIn) return false;

            const supportTypes = SORTED_SEARCH_TYPE[narrowToSocialSource(x)];
            if (!supportTypes.includes(searchType)) return false;

            return true;
        });
    }, [isTwitterLoggedIn, searchType]);

    return (
        <nav className="mt-3 flex gap-x-2 px-4">
            {sources.map((source) => {
                const isActive = source === selectedSource;

                return (
                    <SourceTab
                        isActive={isActive}
                        className={classNames('h-6 rounded-md px-1.5 text-sm leading-6', {
                            'bg-highlight text-white': isActive,
                            'bg-input text-lightSecond': !isActive,
                        })}
                        key={source}
                        href={resolveSearchUrl(query, searchType, source)}
                    >
                        {resolveSourceName(source)}
                    </SourceTab>
                );
            })}
        </nav>
    );
});
