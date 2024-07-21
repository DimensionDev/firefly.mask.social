import { type Draft, produce } from 'immer';
import { first } from 'lodash-es';

import { queryClient } from '@/configs/queryClient.js';
import type { Source } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import { type Notification, NotificationType, type Post, type Profile } from '@/providers/types/SocialMedia.js';

type Patcher = (old: Draft<Notification>) => void;

export function patchNotificationQueryData(source: Source, patcher: Patcher) {
    queryClient.setQueryData<{ pages: Array<{ data: Notification[] }> }>(['notifications', source, true], (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
            draft.pages.forEach((page) => {
                page.data.forEach(patcher);
            });
        });
    });
}

type PostPatcher = (old: Draft<Post>) => void;
export function patchNotificationQueryDataOnPost(source: Source, patcher: PostPatcher) {
    patchNotificationQueryData(source, (notification) => {
        // Only these these types have interaction.
        let target: Post | undefined = undefined;
        const type = notification.type;
        switch (type) {
            case NotificationType.Comment:
                if (notification.comment) {
                    target = notification.comment;
                }
                break;
            case NotificationType.Mention:
                if (notification.post) {
                    target = notification.post;
                }
                break;
            case NotificationType.Quote:
                target = notification.quote;
                break;
            case NotificationType.Act:
            case NotificationType.Follow:
            case NotificationType.Mirror:
            case NotificationType.Reaction:
                break;
            default:
                safeUnreachable(type);
        }
        if (target) {
            patcher(target);
        }
    });
}

type ProfilePatcher = (old: Draft<Profile>) => void;
export function patchNotificationQueryDataOnAuthor(source: Source, patcher: ProfilePatcher) {
    patchNotificationQueryData(source, (notification) => {
        let target: Profile | undefined = undefined;
        const type = notification.type;
        switch (type) {
            case NotificationType.Comment:
                if (notification.comment) {
                    target = notification.comment.author;
                }
                break;
            case NotificationType.Mention:
            case NotificationType.Quote:
            case NotificationType.Act:
                if (notification.post) {
                    target = notification.post.author;
                }
                break;
            case NotificationType.Follow:
                target = first(notification.followers);
                break;
            case NotificationType.Mirror:
                target = first(notification.mirrors);
                break;
            case NotificationType.Reaction:
                target = first(notification.reactors);
                break;
            default:
                safeUnreachable(type);
        }
        if (target) {
            patcher(target);
        }
    });
}
