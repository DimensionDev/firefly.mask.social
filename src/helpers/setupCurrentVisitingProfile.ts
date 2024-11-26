import { ProfileIdentifier } from '@masknet/shared-base';

import { Source } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { createConstantSubscription } from '@/helpers/subscription.js';
import {
    __setSiteAdaptorContext__,
    type __SiteAdaptorContext__,
    type IdentityResolved,
} from '@/mask/bindings/index.js';
import { createMaskSiteAdaptorContext } from '@/mask/helpers/createMaskContext.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

const fireflyappProfile: Profile = {
    profileId: 'fireflyapp',
    source: Source.Farcaster,
    profileSource: Source.Farcaster,
    handle: 'fireflyapp',
    displayName: 'Firefly App',
    fullHandle: 'fireflyapp',
    pfp: 'https://firefly.mask.social/image/firefly-light-avatar.png',
    followerCount: 0,
    followingCount: 0,
    status: ProfileStatus.Active,
    verified: true,
};

export async function setupCurrentVisitingProfile(profile: Profile | null, lastRecognizedProfile?: IdentityResolved) {
    if (!profile) return;
    const { handle, displayName, pfp } = profile;
    const options: Partial<__SiteAdaptorContext__> = {
        currentVisitingProfile: createConstantSubscription<IdentityResolved>({
            nickname: displayName,
            avatar: pfp,
            identifier: ProfileIdentifier.of(SITE_HOSTNAME, handle).unwrapOr(undefined),
            isOwner: true,
        }),
    };
    if (lastRecognizedProfile) {
        options.lastRecognizedProfile = createConstantSubscription<IdentityResolved>(lastRecognizedProfile);
    }
    __setSiteAdaptorContext__(createMaskSiteAdaptorContext(options));
}

export function setupCurrentVisitingProfileAsFireflyApp() {
    setupCurrentVisitingProfile(fireflyappProfile);
}

export function setupMyProfile(myProfile: IdentityResolved) {
    setupCurrentVisitingProfile(fireflyappProfile, myProfile);
}
