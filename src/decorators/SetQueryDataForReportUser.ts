import { SocialPlatform } from '@/constants/enum.js';
import { deletePostsOfUserFromQueryData } from '@/helpers/deletePostsOfUserFromQueryData.js';
import type { Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

export function SetQueryDataForDeletePost(source: SocialPlatform) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        const method = target.prototype.reportUser as Provider['reportUser'];

        Object.defineProperty(target.prototype, 'reportUser', {
            value: async (profileId: string) => {
                const m = method as (profileId: string) => Promise<boolean>;
                const result = await m?.call(target.prototype, profileId);

                if (result) deletePostsOfUserFromQueryData(source, profileId);

                return result;
            },
        });

        return target;
    };
}
