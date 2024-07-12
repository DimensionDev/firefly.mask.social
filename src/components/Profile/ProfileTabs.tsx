'use client';

import { usePathname } from 'next/navigation.js';
import { startTransition, useEffect } from 'react';
import urlcat from 'urlcat';

import { ClickableArea } from '@/components/ClickableArea.js';
import { SquareSourceIcon } from '@/components/SquareSourceIcon.js';
import { PageRoute, type SocialSource, Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { useUpdateParams } from '@/hooks/useUpdateParams.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

interface ProfileTabsProps {
    profiles: FireflyProfile[];
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
    const { setProfileTab } = useProfileTabState();
    const { profileTab: profileTabContext, setProfileTab: setProfileTabContext } = ProfileTabContext.useContainer();

    const pathname = usePathname();
    const updateParams = useUpdateParams();

    const isProfilePage = pathname === PageRoute.Profile;
    const isOtherProfilePage = pathname !== '/profile' && isRoutePathname(pathname, '/profile');

    useEffect(() => {
        if (!isProfilePage) return;

        const profile = getCurrentProfile(profileTabContext.source as SocialSource);
        if (!profile) return;

        const profileTab = { source: profileTabContext.source, identity: resolveProfileId(profile) };
        setProfileTabContext(profileTab);
        setProfileTab(profileTab);
    }, [isProfilePage, setProfileTab, profileTabContext, setProfileTabContext]);

    if (profiles.length <= 1) return null;

    return (
        <div className="scrollable-tab flex gap-2 px-5">
            {profiles.map((profile, index) => {
                const colors = resolveProfileTabColor(profile.source);

                const isActive =
                    profile.source === Source.Wallet
                        ? isSameAddress(profile.identity, profileTabContext.identity)
                        : profileTabContext.identity === profile.identity;

                return (
                    <ClickableArea
                        onClick={() => {
                            startTransition(() => {
                                const profileTab = { source: profile.source, identity: profile.identity };

                                setProfileTabContext(profileTab);
                                if (isProfilePage) setProfileTab(profileTab);

                                updateParams(
                                    new URLSearchParams({
                                        source: resolveSourceInURL(profile.source),
                                    }),
                                    isOtherProfilePage ? urlcat('/profile/:id', { id: profile.identity }) : undefined,
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
