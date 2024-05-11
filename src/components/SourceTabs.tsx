'use client';

import { usePathname, useSearchParams } from 'next/navigation.js';
import { startTransition } from 'react';

import { PageRoute, SearchType, Source } from '@/constants/enum.js';
import { SORTED_BOOKMARK_SOURCES, SORTED_HOME_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { replaceSearchParams } from '@/helpers/replaceSearchParams.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

export function SourceTabs() {
    const currentSource = useGlobalState.use.currentSource();
    const updateCurrentSource = useGlobalState.use.updateCurrentSource();

    const { currentProfileSession: fireflySession } = useFireflyStateStore();
    const { updateSearchType } = useSearchStateStore();

    const searchParams = useSearchParams();
    const pathname = usePathname();

    if (
        (pathname === PageRoute.Following && currentSource === Source.Article && !fireflySession) ||
        (pathname !== PageRoute.Following && pathname !== PageRoute.Home && currentSource === Source.Article)
    ) {
        updateCurrentSource(Source.Farcaster);
    }

    const sources =
        pathname === PageRoute.Bookmarks
            ? SORTED_BOOKMARK_SOURCES
            : SORTED_HOME_SOURCES.filter((x) => {
                  if (x !== Source.Article) return true;
                  if (pathname === PageRoute.Home || (pathname === PageRoute.Following && !!fireflySession))
                      return true;
                  return false;
              });

    return (
        <div className="border-b border-line bg-primaryBottom px-4">
            <nav className="scrollable-tab -mb-px flex space-x-4" aria-label="Tabs">
                {sources.map((value) => (
                    <li key={value} className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
                        <a
                            className={classNames(
                                currentSource === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                                'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                                'md:h-[60px] md:py-[18px] md:leading-6',
                            )}
                            aria-current={currentSource === value ? 'page' : undefined}
                            onClick={() =>
                                startTransition(() => {
                                    scrollTo(0, 0);
                                    updateCurrentSource(value);
                                    const type = searchParams.get('type') as SearchType;

                                    if (type === SearchType.Channels && value === Source.Lens) {
                                        updateSearchType(SearchType.Posts);
                                        replaceSearchParams(
                                            new URLSearchParams({
                                                source: resolveSourceInURL(value),
                                                type: SearchType.Posts,
                                            }),
                                        );
                                    } else {
                                        replaceSearchParams(
                                            new URLSearchParams({
                                                source: resolveSourceInURL(value),
                                            }),
                                        );
                                    }
                                })
                            }
                        >
                            {resolveSourceName(value)}
                        </a>
                    </li>
                ))}
            </nav>
        </div>
    );
}
