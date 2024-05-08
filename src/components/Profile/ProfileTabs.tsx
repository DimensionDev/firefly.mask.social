'use client';

import { createLookupTableResolver } from '@masknet/shared-base';
import { isSameAddress } from '@masknet/web3-shared-base';
import { isUndefined, omitBy } from 'lodash-es';
import { usePathname } from 'next/navigation.js';
import { startTransition } from 'react';
import urlcat from 'urlcat';

import { ClickableArea } from '@/components/ClickableArea.js';
import { SourceSquareIcon } from '@/components/SourceSquareIcon.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { replaceSearchParams } from '@/helpers/replaceSearchParams.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';

interface ProfileTabsProps {
    profiles: FireFlyProfile[];
}

const resolveProfileTabColor = createLookupTableResolver<
    Source,
    {
        background?: string;
        darkBackground?: string;
        color?: string;
        darkColor?: string;
        activeBackground?: string;
        activeColor?: string;
        borderColor?: string;
    }
>(
    {
        [Source.Lens]: {
            background: 'rgba(171, 254, 44, 0.2)',
            darkBackground: 'rgba(171, 254, 44, 0.3)',
            color: '#00501E',
            darkColor: '#ffffff',
            activeColor: '#00501E',
            activeBackground: '#ABFE2C',
            borderColor: '#00501E',
        },
        [Source.Farcaster]: {
            background: 'rgba(133, 93, 205, 0.12)',
            darkBackground: 'rgba(133, 93, 205, 0.3)',
            color: '#855DCD',
            darkColor: '#ffffff',
            activeColor: '#ffffff',
            activeBackground: '#855DCD',
            borderColor: '#ffffff',
        },
        [Source.Article]: {},
        [Source.Twitter]: {},
        [Source.Wallet]: {},
    },
    {},
);
export function ProfileTabs({ profiles }: ProfileTabsProps) {
    const { isDarkMode } = useDarkMode();
    const { update, identity: currentProfile } = ProfileContext.useContainer();
    const pathname = usePathname();

    const isOtherProfile = pathname !== '/profile' && isRoutePathname(pathname, '/profile');
    return (
        <div className="scrollableTabs flex gap-2 px-5">
            {profiles.map((profile, index) => {
                const colors = resolveProfileTabColor(profile.source);

                const isActive =
                    profile.source === Source.Wallet
                        ? isSameAddress(profile.identity, currentProfile)
                        : currentProfile === profile.identity;

                return (
                    <ClickableArea
                        onClick={() => {
                            startTransition(() => {
                                scrollTo(0, 0);

                                update?.({
                                    source: profile.source,
                                    identity: profile.identity,
                                });

                                const params = omitBy(
                                    {
                                        source: resolveSourceInURL(profile.source),
                                        identity: pathname === '/profile' ? profile.identity : undefined,
                                    },
                                    isUndefined,
                                ) as Record<string, string>;

                                replaceSearchParams(
                                    new URLSearchParams(params),
                                    isOtherProfile ? urlcat('/profile/:id', { id: profile.identity }) : undefined,
                                );
                            });
                        }}
                        className={classNames('flex cursor-pointer items-center gap-1 rounded-lg p-1 px-2', {
                            'bg-main': isActive,
                            'text-primaryBottom': isActive,
                            'bg-thirdMain': !isActive,
                            'border-primaryBottom': isActive,
                            border: isActive,
                        })}
                        style={{
                            background: isActive
                                ? colors.activeBackground
                                : isDarkMode
                                  ? colors.darkBackground
                                  : colors.background,
                            color: isActive ? colors.activeColor : isDarkMode ? colors.darkColor : colors.color,
                        }}
                        key={index}
                    >
                        <SourceSquareIcon
                            source={profile.source}
                            size={14}
                            forceLight={isActive}
                            className="rounded-[4px]"
                            style={{
                                border: isActive && colors.borderColor ? `1px solid ${colors.borderColor}` : undefined,
                            }}
                        />
                        <span className="whitespace-nowrap text-[10px] leading-3">
                            {profile.source === Source.Wallet ? profile.displayName : `@${profile.displayName}`}
                        </span>
                    </ClickableArea>
                );
            })}
        </div>
    );
}
