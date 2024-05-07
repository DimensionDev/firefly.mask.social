import type { Draft } from 'immer';

import type { SocialSource } from '@/constants/enum.js';
import { deletePostsOfUserFromQueryData } from '@/helpers/deletePostsOfUserFromQueryData.js';
import { patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Post, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function setBlockStatus(source: SocialSource, profileId: string, status: boolean) {
    const matcher = (post: Draft<Post> | undefined) => post?.author.profileId === profileId;
    patchPostQueryData(source, matcher, (draft) => {
        if (draft.author.profileId !== profileId) return;
        draft.author.viewerContext = {
            ...draft.author.viewerContext,
            blocking: status,
        };
    });
}

const METHODS_BE_OVERRIDDEN = ['blockUser', 'unblockUser'] as const;

export function SetQueryDataForBlockUser(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (profileId: string) => {
                    const m = method as (profileId: string) => Promise<boolean>;
                    const result = await m?.call(target.prototype, profileId);
                    if (!result) return false;

                    if (key === 'blockUser') {
                        deletePostsOfUserFromQueryData(source, profileId);
                    }
                    setBlockStatus(source, profileId, key === 'blockUser');

                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
