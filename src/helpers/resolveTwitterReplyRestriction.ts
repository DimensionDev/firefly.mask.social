import { createLookupTableResolver } from '@masknet/shared-base';

import { RestrictionType } from '@/constants/enum.js';

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
