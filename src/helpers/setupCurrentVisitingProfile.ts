import {
    __setSiteAdaptorContext__,
    type __SiteAdaptorContext__,
    type IdentityResolved,
} from '@masknet/plugin-infra/content-script';
import { createConstantSubscription, ProfileIdentifier } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { SITE_HOSTNAME } from '@/constants/index.js';
import { createMaskSiteAdaptorContext } from '@/helpers/createMaskContext.js';
import { type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

const fireflyappProfile: Profile = {
    profileId: 'fireflyapp',
    handle: 'fireflyapp',
    displayName: 'Firefly App',
    fullHandle: 'fireflyapp',
    pfp: 'https://firefly.mask.social/image/firefly-light-avatar.png',
    followerCount: 0,
    followingCount: 0,
    status: ProfileStatus.Active,
    source: SocialPlatform.Lens,
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
