import { createLookupTableResolver } from '@masknet/shared-base';

import { RestrictionType } from '@/types/compose.js';

export const resolveTwitterReplyRestriction = createLookupTableResolver<
    RestrictionType,
    '' | 'following' | 'mentionedUsers'
>(
    {
        [RestrictionType.Everyone]: '',
        [RestrictionType.OnlyPeopleYouFollow]: 'following',
        [RestrictionType.MentionedUsers]: 'mentionedUsers',
    },
    '',
);
