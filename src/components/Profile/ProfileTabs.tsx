'use client';

import { createLookupTableResolver } from '@masknet/shared-base';
import { isSameAddress } from '@masknet/web3-shared-base';
import { usePathname } from 'next/navigation.js';
import { startTransition } from 'react';
import urlcat from 'urlcat';

import { ClickableArea } from '@/components/ClickableArea.js';
import { SquareSourceIcon } from '@/components/SquareSourceIcon.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { useUpdateParams } from '@/hooks/useUpdateParams.js';
import type { FireFlyProfile } from '@/providers/types/Firefly.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

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
        [Source.Twitter]: {},
        [Source.Firefly]: {},
        [Source.Article]: {},
        [Source.Wallet]: {},
        [Source.NFTs]: {},
    },
    {},
);

export function ProfileTabs({ profiles }: ProfileTabsProps) {
    const { isDarkMode } = useDarkMode();
    const updateCurrentProfileState = useProfileTabState.use.updateCurrentProfileState();
    const { update, identity: currentProfile } = ProfileContext.useContainer();
    const pathname = usePathname();
    const updateParams = useUpdateParams();

    const isProfilePage = pathname === PageRoute.Profile;
    const isOtherProfile = pathname !== '/profile' && isRoutePathname(pathname, '/profile');

    if (profiles.length <= 1) return null;

    return (
        <div className="scrollable-tab flex gap-2 px-5">
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
                                update?.({
                                    source: profile.source,
                                    identity: profile.identity,
                                });

                                if (isProfilePage)
                                    updateCurrentProfileState({
                                        source: profile.source,
                                        identity: profile.identity,
                                    });

                                updateParams(
                                    new URLSearchParams({
                                        source: resolveSourceInURL(profile.source),
                                    }),
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
                        <SquareSourceIcon
                            source={profile.source}
                            size={14}
                            forceLight={isActive}
                            className="rounded-[4px]"
                            style={{
                                border: isActive && colors.borderColor ? `1px solid ${colors.borderColor}` : undefined,
                            }}
                        />
                        <span
                            ref={(ref) => {
                                if (isActive) ref?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                            }}
                            className="whitespace-nowrap text-[10px] leading-3"
                        >
                            {profile.source === Source.Wallet ? profile.displayName : `@${profile.displayName}`}
                        </span>
                    </ClickableArea>
                );
            })}
        </div>
    );
}
