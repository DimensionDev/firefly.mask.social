import type { ProfileFragment } from '@lens-protocol/client';

import { getAvatar } from '@/helpers/formatLensProfile.js';
import type { SuggestedFollowUserProfile } from '@/providers/types/SocialMedia.js';

export function formatLensSuggestedFollowUserProfile(result: ProfileFragment): SuggestedFollowUserProfile {
    return {
        profileId: result.id,
        displayName: result.metadata?.displayName || result.handle?.localName || '',
        handle: (result.handle?.localName || result.metadata?.displayName) ?? '',
        fullHandle: result.handle?.fullHandle || '',
        pfp: getAvatar(result),
        viewerContext: {
            blocking: result.operations.isBlockedByMe.value,
        },
    };
}
