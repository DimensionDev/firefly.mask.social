import { compact, first } from 'lodash-es';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import type { Profile } from '@/providers/types/Firefly.js';

export function formatSearchIdentities(identities: Array<Record<SocialSourceInURL, Profile[] | null>>) {
    return identities
        .map((x) => {
            const target = SORTED_SOCIAL_SOURCES.map((source) => x[resolveSocialSourceInUrl(source)])
                .flatMap((value) => value ?? EMPTY_LIST)
                .find((profile) => profile.hit);
            if (!target) return;

            const allProfile = compact(
                SORTED_SOCIAL_SOURCES.map((source) => first(x[resolveSocialSourceInUrl(source)])).map((x) => {
                    if (target.platform === x?.platform) return target;
                    return x;
                }),
            );

            const platform = resolveSocialSource(target.platform);
            return {
                platform,
                profileId: target.platform_id,
                avatar: getStampAvatarByProfileId(platform, target.platform_id),
                handle: target.handle,
                name: target.name,
                allProfile,
            };
        })
        .filter((handle) => !!handle);
}
