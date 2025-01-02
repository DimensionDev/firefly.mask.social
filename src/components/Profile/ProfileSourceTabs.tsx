'use client';

import { useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import type { ProfilePageSource } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import type { FireflyIdentity, FireflyProfile } from '@/providers/types/Firefly.js';

export function ProfileSourceTabs({
    profiles: otherProfiles,
    identity,
}: {
    profiles: FireflyProfile[];
    identity: FireflyIdentity;
}) {
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));

    const profiles = isCurrentProfile ? currentProfiles : otherProfiles;

    const resolveUrl = (x: ProfilePageSource) => {
        const profile = profiles.find((profile) => profile.identity.source === x);
        return resolveProfileUrl(x, profile?.identity.id ?? identity.id);
    };

    const currentSources = useMemo(() => {
        return SORTED_PROFILE_SOURCES.filter((value) => {
            if (profiles.length) {
                return profiles.find((profile) => profile.identity.source === value);
            }

            return value === identity.source;
        });
    }, [profiles, identity.source]);

    return (
        <SourceTabs>
            {currentSources.map((x) => (
                <SourceTab key={x} href={resolveUrl(x)} isActive={x === identity.source}>
                    {resolveSourceName(x)}
                </SourceTab>
            ))}
        </SourceTabs>
    );
}
