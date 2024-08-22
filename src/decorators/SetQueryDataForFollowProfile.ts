import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { SearchType, Source } from '@/constants/enum.js';
import { patchNotificationQueryDataOnAuthor } from '@/helpers/patchNotificationQueryData.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { type Notification, type Profile, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

function setFollowStatus(source: Source, profileId: string, status: boolean) {
    const matcher: Matcher = (post) => post?.author.profileId === profileId;
    const patcher = (old: Draft<Profile>, status: boolean) => {
        old.viewerContext = {
            ...old.viewerContext,
            following: status,
        };
    };
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
                        patcher(profile, status);
                    }
                }
            }
        });
    };

    queryClient.setQueriesData<PagesData>({ queryKey: ['profiles', source] }, profilesPatcher);
    queryClient.setQueriesData<PagesData>(
        { queryKey: ['search', SearchType.Profiles], type: 'active' },
        profilesPatcher,
    );
    queryClient.setQueriesData<PagesData>({ queryKey: ['suggested-follows', source], type: 'active' }, profilesPatcher);
    queryClient.setQueriesData<Profile[]>({ queryKey: ['suggested-follows-lite'] }, (profiles) => {
        if (!profiles) return profiles;
        for (const profile of profiles) {
            if (profile.profileId === profileId) {
                patcher(profile, status);
            }
        }
        return profiles;
    });

    patchNotificationQueryDataOnAuthor(source, (profile) => {
        if (profile.profileId === profileId) {
            patcher(profile, status);
        }
    });

    // Notifications user list tippy
    function matchProfile(profiles: Profile[], profileId: string) {
        for (const p of profiles) {
            if (p.profileId === profileId) {
                patcher(p, status);
                break;
            }
        }
    }
    queryClient.setQueryData<{ pages: Array<{ data: Notification[] }> }>(['notifications', source, true], (old) => {
        if (!old?.pages) return old;
        return produce(old, (draft) => {
            for (const page of draft.pages) {
                for (const notification of page.data) {
                    if ('reactors' in notification) {
                        matchProfile(notification.reactors, profileId);
                    } else if ('mirrors' in notification) {
                        matchProfile(notification.mirrors, profileId);
                    } else if ('followers' in notification) {
                        matchProfile(notification.followers, profileId);
                    } else if ('actions' in notification) {
                        matchProfile(notification.actions, profileId);
                    }
                }
            }
        });
    });
}

const METHODS_BE_OVERRIDDEN = ['follow', 'unfollow'] as const;

export function SetQueryDataForFollowProfile(source: Source) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (profileId: string) => {
                    const status = key === 'follow';
                    setFollowStatus(source, profileId, status);
                    try {
                        const m = method as (profileId: string) => Promise<boolean>;
                        return await m?.call(target.prototype, profileId);
                    } catch (error) {
                        // rolling back
                        setFollowStatus(source, profileId, !status);
                        throw error;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
