import { formatLensProfile } from '@/helpers/formatLensProfile.js';
import type { ProfileWhoReactedResultFragment, PublicationReactionType } from '@lens-protocol/client';

export function formatLensPostReaction(items: ProfileWhoReactedResultFragment[], reaction: PublicationReactionType) {
    return items.map((item) => {
        return {
            profile: formatLensProfile(item.profile),
            reaction: item.reactions[0].reaction,
        };
    });
}
