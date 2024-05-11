import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { SearchType, type SocialSource } from '@/constants/enum.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import type { Profile, Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function setFollowStatus(source: SocialSource, profileId: string, status: boolean) {
    const matcher: Matcher = (post) => post?.author.profileId === profileId;
    patchPostQueryData(source, matcher, (draft) => {
        if (draft.author.profileId !== profileId) return;
        draft.author.viewerContext = {
            ...draft.author.viewerContext,
            following: status,
        };
    });

    queryClient.setQueriesData<Profile>({ queryKey: ['profile', source] }, (old) => {
        if (!old || old.profileId !== profileId) return old;
        return produce(old, (draft) => {
            draft.viewerContext = {
                ...draft.viewerContext,
                following: status,
            };
        });
    });

    type PagesData = { pages: Array<{ data: Profile[] }> };
    const profilesPatcher = (old: Draft<PagesData> | undefined) => {
        if (!old?.pages) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const profile of page.data) {
                    if (profile.profileId === profileId) {
                        profile.viewerContext = {
                            ...profile.viewerContext,
                            following: status,
                        };
                    }
                }
            }
        });
    };

    queryClient.setQueriesData<PagesData>({ queryKey: ['profiles', source] }, profilesPatcher);
    queryClient.setQueriesData<PagesData>({ queryKey: ['search', SearchType.Users], type: 'active' }, profilesPatcher);
}

const METHODS_BE_OVERRIDDEN = ['follow', 'unfollow'] as const;

export function SetQueryDataForFollowUser(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (profileId: string) => {
                    const m = method as (profileId: string) => Promise<boolean>;
                    const result = await m?.call(target.prototype, profileId);

                    setFollowStatus(source, profileId, key === 'follow');
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
