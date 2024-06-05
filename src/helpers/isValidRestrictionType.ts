import { safeUnreachable } from '@masknet/kit';

import { RestrictionType, type SocialSource, Source } from '@/constants/enum.js';

export function isValidRestrictionType(type: RestrictionType, availableSources: SocialSource[]) {
    switch (type) {
        case RestrictionType.Everyone:
            return true;
        case RestrictionType.OnlyPeopleYouFollow:
            return availableSources.length ? !availableSources.includes(Source.Farcaster) : true;
        case RestrictionType.MentionedProfiles:
            return availableSources.length === 1 && availableSources.includes(Source.Twitter);
        default:
            safeUnreachable(type);
            return false;
    }
}
