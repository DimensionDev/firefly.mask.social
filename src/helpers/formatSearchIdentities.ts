import { compact, first } from 'lodash-es';

import { Source, SourceInURL } from '@/constants/enum.js';
import { SORTED_PROFILE_SOURCES } from '@/constants/index.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import type { Profile, SearchProfileResponse } from '@/providers/types/Firefly.js';

const validPlatforms = [SourceInURL.Farcaster, SourceInURL.Lens, SourceInURL.Twitter];

function fixProfilePlatform(profile: Profile) {
    if (!validPlatforms.includes(profile.platform)) {
        return {
            ...profile,
            platform: SourceInURL.Wallet,
            // we use owner as platform_id for ens
            platform_id: profile.owner || profile.platform_id,
        } as Profile;
    }

    return profile;
}

export function formatSearchIdentities(
    identities: Required<SearchProfileResponse>['data']['list'],
): Array<{ profile: Profile; related: Profile[] }> {
    return identities
        .map((x) => {
            const target = Object.values(x)
                .flat()
                .find((x) => x?.hit);
            if (!target) return;

            const allProfile = compact(
                SORTED_PROFILE_SOURCES.map((source) => {
                    const profile =
                        source === Source.Wallet
                            ? first(x.ens || x.eth || x.solana)
                            : first(x[resolveSocialSourceInUrl(source)]);
                    if (target.platform === profile?.platform) return fixProfilePlatform(target);
                    return profile ? fixProfilePlatform(profile) : null;
                }),
            );

            return {
                profile: fixProfilePlatform(target),
                related: allProfile,
            };
        })
        .filter((handle) => !!handle);
}
