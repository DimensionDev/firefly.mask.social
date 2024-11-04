'use client';

import { useMemo } from 'react';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SourceTab } from '@/components/SourceTabs/SourceTab.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { createSourceTabs } from '@/helpers/createSourceTabs.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
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
    const tabs = useMemo(
        () =>
            createSourceTabs(
                SORTED_PROFILE_SOURCES.filter((value) => {
                    return profiles.find((profile) => profile.identity.source === value);
                }),
                (x) => {
                    const profile = profiles.find((profile) => profile.identity.source === x);
                    return resolveProfileUrl(x, profile?.identity.id ?? identity.id);
                },
            ),
        [profiles, identity.id],
    );

    return (
        <SourceTabs>
            {tabs.map((x) => (
                <SourceTab key={x.source} href={x.url} isActive={x.source === identity.source}>
                    {x.label}
                </SourceTab>
            ))}
        </SourceTabs>
    );
}
