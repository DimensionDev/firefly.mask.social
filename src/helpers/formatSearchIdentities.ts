import { compact, first } from 'lodash-es';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import type { Profile } from '@/providers/types/Firefly.js';

export function formatSearchIdentities(
    identities: Array<Record<SocialSourceInURL | 'eth' | 'solana', Profile[] | null>>,
): Array<{ profile: Profile; related: Profile[] }> {
    return identities
        .map((x) => {
            const target = SORTED_SOCIAL_SOURCES.map((source) => x[resolveSocialSourceInUrl(source)]).flatMap(
                (value) => value ?? EMPTY_LIST,
            )[0];
            if (!target) return;

            const allProfile = compact(
                SORTED_SOCIAL_SOURCES.map((source) => first(x[resolveSocialSourceInUrl(source)])).map((x) => {
                    if (target.platform === x?.platform) return target;
                    return x;
                }),
            );

            return {
                profile: target,
                related: allProfile,
            };
        })
        .filter((handle) => !!handle);
}
