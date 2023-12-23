import { __setSiteAdaptorContext__, type IdentityResolved } from '@masknet/plugin-infra/content-script';
import { createConstantSubscription, ProfileIdentifier } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { createMaskSiteAdaptorContext } from '@/helpers/createMaskContext.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

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

export function setupCurrentVisitingProfileAsFireflyApp() {
    setupCurrentVisitingProfile({
        profileId: 'fireflyapp',
        handle: 'Firefly App',
        displayName: 'fireflyapp',
        fullHandle: 'fireflyapp',
        pfp: 'https://firefly.mask.social/image/firefly-light-avatar.png',
        followerCount: 0,
        followingCount: 0,
        status: ProfileStatus.Active,
        source: SocialPlatform.Lens,
        verified: true,
    });
}
