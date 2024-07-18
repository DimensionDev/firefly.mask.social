import { RestrictionType } from '@/constants/enum.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveTwitterReplyRestriction = createLookupTableResolver<
    RestrictionType,
    'following' | 'mentionedUsers' | undefined
>(
    {
        [RestrictionType.Everyone]: undefined,
        [RestrictionType.OnlyPeopleYouFollow]: 'following',
        [RestrictionType.MentionedProfiles]: 'mentionedUsers',
    },
    undefined,
);
