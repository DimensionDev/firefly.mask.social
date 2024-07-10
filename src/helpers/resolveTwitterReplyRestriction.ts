import { RestrictionType } from '@/constants/enum.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveTwitterReplyRestriction = createLookupTableResolver<
    RestrictionType,
    '' | 'following' | 'mentionedUsers'
>(
    {
        [RestrictionType.Everyone]: '',
        [RestrictionType.OnlyPeopleYouFollow]: 'following',
        [RestrictionType.MentionedProfiles]: 'mentionedUsers',
    },
    '',
);
