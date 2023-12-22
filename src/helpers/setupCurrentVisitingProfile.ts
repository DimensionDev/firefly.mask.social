import { __setSiteAdaptorContext__, type IdentityResolved } from '@masknet/plugin-infra/content-script';
import { createConstantSubscription, ProfileIdentifier } from '@masknet/shared-base';

import { SITE_HOSTNAME } from '@/constants/index.js';
import { createMaskSiteAdaptorContext } from '@/helpers/createMaskContext.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function setupCurrentVisitingProfile(profile: Profile | null) {
    if (!profile) return;
    const { handle, displayName, pfp } = profile;
    __setSiteAdaptorContext__(
        createMaskSiteAdaptorContext({
            currentVisitingProfile: createConstantSubscription<IdentityResolved>({
                nickname: displayName,
                avatar: pfp,
                identifier: ProfileIdentifier.of(SITE_HOSTNAME, handle).unwrapOr(undefined),
                isOwner: true,
            }),
        }),
    );
}
