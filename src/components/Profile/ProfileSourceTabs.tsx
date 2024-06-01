'use client';

import { usePathname } from 'next/navigation.js';
import { startTransition, useMemo } from 'react';
import urlcat from 'urlcat';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getProfileIdentity } from '@/helpers/getProfileIdentity.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { replaceSearchParams } from '@/helpers/replaceSearchParams.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

interface ProfileSourceTabs {
    profiles: FireFlyProfile[];
}

export function ProfileSourceTabs({ profiles }: ProfileSourceTabs) {
    const updateCurrentProfileState = useProfileTabState.use.updateCurrentProfileState();
    const { update, source } = ProfileContext.useContainer();

    const pathname = usePathname();
    const isProfilePage = pathname === PageRoute.Profile;
    const isOtherProfile = pathname !== PageRoute.Profile && isRoutePathname(pathname, PageRoute.Profile);

    const tabs = useMemo(() => {
        return SORTED_PROFILE_SOURCES.filter((source) => {
            if (isProfilePage) {
                if (source === Source.Wallet) return profiles.some((x) => x.source === Source.Wallet);
                return true;
            }
            return profiles.some((x) => x.source === source);
        });
    }, [profiles, isProfilePage]);

    return (
        <div className="border-b border-line bg-primaryBottom px-4">
            <nav className="scrollable-tab -mb-px flex space-x-4" aria-label="Tabs">
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

                                    const currentProfile =
                                        value !== Source.Wallet && value !== Source.Article && isProfilePage
                                            ? getCurrentProfile(narrowToSocialSource(value))
                                            : undefined;

                                    const target = currentProfile
                                        ? {
                                              source: currentProfile.source,
                                              identity: getProfileIdentity(currentProfile),
                                          }
                                        : profiles.find((x) => x.source === value);

                                    if (isProfilePage)
                                        updateCurrentProfileState({ source: value, identity: target?.identity ?? '' });

                                    update?.({
                                        source: value,
                                        identity: target?.identity,
                                    });
                                    replaceSearchParams(
                                        new URLSearchParams({
                                            source: resolveSourceInURL(value),
                                        }),
                                        isOtherProfile && target
                                            ? urlcat('/profile/:id', { id: target.identity })
                                            : undefined,
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
