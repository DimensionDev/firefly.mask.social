'use client';

import { memo, useMemo } from 'react';

import { SourceNav } from '@/components/SourceNav.js';
import { SearchType, Source } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
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
        <SourceNav
            source={selectedSource}
            sources={sources}
            urlResolver={(x) => resolveSearchUrl(query, searchType, x)}
            nameResolver={(x) => resolveSourceName(x)}
            className="flex gap-x-2 px-4"
        />
    );
});
