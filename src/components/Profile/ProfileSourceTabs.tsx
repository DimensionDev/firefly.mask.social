'use client';

import { usePathname } from 'next/navigation.js';
import { useMemo } from 'react';
import urlcat from 'urlcat';

import { ClickableButton } from '@/components/ClickableButton.js';
import { PageRoute, Source } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsMyRelatedProfile } from '@/hooks/useIsMyRelatedProfile.js';
import { useUpdateParams } from '@/hooks/useUpdateParams.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

interface ProfileSourceTabs {
    profiles: FireflyProfile[];
}

export function ProfileSourceTabs({ profiles }: ProfileSourceTabs) {
    const { identity } = useFireflyIdentityState();

    const pathname = usePathname();
    const updateParams = useUpdateParams();

    const isProfilePage = pathname === PageRoute.Profile;
    const isMyProfile = useIsMyRelatedProfile(identity.source, identity.id);

    const tabs = useMemo(() => {
        return SORTED_PROFILE_SOURCES.filter((source) => {
            if (isProfilePage) {
                if (source === Source.Wallet) return profiles.some((x) => x.identity.source === Source.Wallet);
                return true;
            }
            return profiles.some((x) => x.identity.source === source);
        });
    }, [profiles, isProfilePage]);

    return (
        <nav className="border-b border-line bg-primaryBottom px-4">
            <ul className="scrollable-tab -mb-px flex space-x-4" aria-label="Tabs">
                {tabs.map((value) => (
                    <li key={value} className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
                        <ClickableButton
                            className={classNames(
                                identity.source === value ? 'border-b-2 border-fireflyBrand text-main' : 'text-third',
                                'h-[43px] px-4 text-center text-xl font-bold leading-[43px] hover:cursor-pointer hover:text-main',
                                'md:h-[60px] md:py-[18px] md:leading-6',
                            )}
                            aria-current={identity.source === value ? 'page' : undefined}
                            onClick={() => {
                                const currentProfile =
                                    value !== Source.Wallet &&
                                    value !== Source.Article &&
                                    (isProfilePage || isMyProfile)
                                        ? getCurrentProfile(narrowToSocialSource(value))
                                        : undefined;

                                const target = currentProfile
                                    ? {
                                          source: currentProfile.source,
                                          identity: resolveFireflyProfileId(currentProfile),
                                      }
                                    : profiles.find((x) => x.identity.source === value);

                                updateParams(
                                    new URLSearchParams({
                                        source: resolveSourceInURL(value),
                                    }),
                                    target ? urlcat('/profile/:id', { id: target.identity }) : undefined,
                                );
                            }}
                        >
                            {resolveSourceName(value)}
                        </ClickableButton>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
