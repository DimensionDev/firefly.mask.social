'use client';

import { SourceTabs } from '@/components/SourceTabs/index.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
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

    return (
        <SourceTabs
            source={identity.source}
            sources={SORTED_PROFILE_SOURCES.filter((value) => {
                return profiles.find((profile) => profile.identity.source === value);
            })}
            href={(x) => {
                const profile = profiles.find((profile) => profile.identity.source === x);
                return resolveProfileUrl(x, profile?.identity.id ?? identity.id);
            }}
        />
    );
}
