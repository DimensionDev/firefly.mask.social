import type { ProfileWhoReactedResultFragment, PublicationReactionType } from '@lens-protocol/client';

import { formatLensProfile } from '@/helpers/formatLensProfile.js';

export function formatLensPostReaction(items: ProfileWhoReactedResultFragment[], reaction: PublicationReactionType) {
    return items.map((item) => {
        return {
            profile: formatLensProfile(item.profile),
            reaction: item.reactions[0].reaction,
        };
    });
}
