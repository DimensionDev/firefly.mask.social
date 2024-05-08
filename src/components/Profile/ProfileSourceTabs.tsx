'use client';

import { groupBy, isUndefined, keys, omitBy } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { startTransition, useMemo } from 'react';
import urlcat from 'urlcat';

import { ClickableButton } from '@/components/ClickableButton.js';
import type { Source } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { replaceSearchParams } from '@/helpers/replaceSearchParams.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';

interface ProfileSourceTabs {
    profiles: FireFlyProfile[];
}

export function ProfileSourceTabs({ profiles }: ProfileSourceTabs) {
    const { update, source } = ProfileContext.useContainer();

    const tabs = useMemo(() => {
        return (keys(groupBy(profiles, (x) => x.source)) as Source[]).sort((a, b) => {
            const aIndex = SORTED_PROFILE_SOURCES.indexOf(a);
            const bIndex = SORTED_PROFILE_SOURCES.indexOf(b);
            return aIndex - bIndex;
        });
    }, [profiles]);

    const pathname = usePathname();
    const isOtherProfile = pathname !== '/profile' && isRoutePathname(pathname, '/profile');

    return (
        <div className=" border-b border-line bg-primaryBottom px-4">
            <nav className="scrollableTabs -mb-px flex space-x-4" aria-label="Tabs">
                {tabs.map((value) => (
                    <li key={value} className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
                        <ClickableButton
                            className={classNames(
                                source === value ? 'border-b-2 border-[#9250FF] text-main' : 'text-third',
                                'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                                'md:h-[60px] md:py-[18px] md:leading-6',
                            )}
                            aria-current={source === value ? 'page' : undefined}
                            onClick={() =>
                                startTransition(() => {
                                    scrollTo(0, 0);

                                    const target = profiles.find((x) => x.source === value);
                                    if (!target) return;

                                    update?.({
                                        source: target.source,
                                        identity: target.identity,
                                    });

                                    const params = omitBy(
                                        {
                                            source: resolveSourceInURL(target.source),
                                            identity: pathname === '/profile' ? target.identity : undefined,
                                        },
                                        isUndefined,
                                    ) as Record<string, string>;

                                    replaceSearchParams(
                                        new URLSearchParams(params),
                                        isOtherProfile ? urlcat('/profile/:id', { id: target.identity }) : undefined,
                                    );
                                })
                            }
                        >
                            {resolveSourceName(value)}
                        </ClickableButton>
                    </li>
                ))}
            </nav>
        </div>
    );
}
