import { type FunctionComponent, type SVGAttributes } from 'react';

import CollectIcon from '@/assets/collect-large.svg';
import FollowIcon from '@/assets/follow.svg';
import LikeIcon from '@/assets/like-large.svg';
import MessagesIcon from '@/assets/messages.svg';
import MirrorIcon from '@/assets/mirror-large.svg';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { NotificationType } from '@/providers/types/SocialMedia.js';

export const resolveNotificationIcon = createLookupTableResolver<
    NotificationType,
    FunctionComponent<SVGAttributes<SVGElement>> | null
>(
    {
        [NotificationType.Reaction]: LikeIcon,
        [NotificationType.Act]: CollectIcon,
        [NotificationType.Comment]: MessagesIcon,
        [NotificationType.Mirror]: MirrorIcon,
        [NotificationType.Quote]: MirrorIcon,
        [NotificationType.Follow]: FollowIcon,
        [NotificationType.Mention]: MessagesIcon,
    },
    null,
);
