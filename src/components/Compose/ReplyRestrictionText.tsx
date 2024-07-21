import { Trans } from '@lingui/macro';

import { RestrictionType } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';

interface ReplyRestrictionTextProps {
    type: RestrictionType;
}

export function ReplyRestrictionText({ type }: ReplyRestrictionTextProps) {
    switch (type) {
        case RestrictionType.Everyone:
            return <Trans>Everyone</Trans>;
        case RestrictionType.OnlyPeopleYouFollow:
            return <Trans>Only people you follow</Trans>;
        case RestrictionType.MentionedProfiles:
            return <Trans>Only people you mention</Trans>;
        default:
            safeUnreachable(type);
            return null;
    }
}
