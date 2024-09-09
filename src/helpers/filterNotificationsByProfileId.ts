import type { Notification } from '@/providers/types/SocialMedia.js';

export function filterNotificationsByProfileId(items: Notification[], profileIds: string[] | Set<string>) {
    const profileIdSet = profileIds instanceof Set ? profileIds : new Set(profileIds);
    return items
        .map((item) => {
            if (!item) return item;
            if ('followers' in item) {
                item.followers = item.followers.filter((x) => !profileIdSet.has(x.profileId));
            }
            if ('mirrors' in item) {
                item.mirrors = item.mirrors.filter((x) => !profileIdSet.has(x.profileId));
            }
            if ('reactors' in item) {
                item.reactors = item.reactors.filter((x) => !profileIdSet.has(x.profileId));
            }
            return item;
        })
        .filter((item) => {
            if (!item) return false;
            if ('followers' in item && item.followers.length <= 0) return false;
            if ('mirrors' in item && item.mirrors.length <= 0) return false;
            if ('reactors' in item && item.reactors.length <= 0) return false;
            if ('post' in item && item.post?.author.profileId && profileIdSet.has(item.post.author.profileId)) {
                return false;
            }
            if (
                'comment' in item &&
                item.comment?.author.profileId &&
                profileIdSet.has(item.comment.author.profileId)
            ) {
                return false;
            }
            if ('quote' in item && item.quote?.author.profileId && profileIdSet.has(item.quote.author.profileId)) {
                return false;
            }
            return true;
        });
}
