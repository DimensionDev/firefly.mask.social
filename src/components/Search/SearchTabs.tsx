'use client';

import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo, useMemo } from 'react';

import { SearchType, type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SEARCH_TYPE, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

function fixSearchUrl(query: string, type: SearchType, source: Source) {
    let resolvedSource = source;
    if (!SORTED_SEARCH_TYPE[source as SocialSource]?.includes(type)) {
        resolvedSource = SORTED_SOCIAL_SOURCES.find((x) => SORTED_SEARCH_TYPE[x].includes(type)) ?? Source.Farcaster;
    }

    return resolveSearchUrl(query, type, resolvedSource);
}

export const SearchTabs = memo(function SearchTabs() {
    const pathname = usePathname();
    const { searchKeyword, source } = useSearchStateStore();

    const tabs = useMemo<Array<{ label: JSX.Element; link: string }>>(() => {
        return [
            {
                label: <Trans>Users</Trans>,
                link: fixSearchUrl(searchKeyword, SearchType.Profiles, source),
            },
            {
                label: <Trans>Posts</Trans>,
                link: fixSearchUrl(searchKeyword, SearchType.Posts, source),
            },
            {
                label: <Trans>NFTs</Trans>,
                link: fixSearchUrl(searchKeyword, SearchType.NFTs, source),
            },
            {
                label: <Trans>Tokens</Trans>,
                link: fixSearchUrl(searchKeyword, SearchType.Tokens, source),
            },
            {
                label: <Trans>Channels</Trans>,
                link: fixSearchUrl(searchKeyword, SearchType.Channels, source),
            },
        ];
    }, [source, searchKeyword]);

    return (
        <nav className="no-scrollbar sticky top-[54px] z-20 flex w-full gap-x-4 overflow-x-auto border-b border-line bg-primaryBottom px-4 md:top-[57px]">
            {tabs.map((tab) => {
                const isActive = isRoutePathname(pathname, tab.link.split('?')[0] as `/${string}`);

                return (
                    <Link
                        key={tab.link}
                        className={classNames('h-[45px] border-b-4 font-bold leading-[45px] transition-all', {
                            'border-transparent text-third': !isActive,
                            'border-highlight text-highlight': isActive,
                        })}
                        href={tab.link}
                    >
                        <span className="px-4">{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
});
