import { type Draft, produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { patchNotificationQueryDataOnAuthor } from '@/helpers/patchNotificationQueryData.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import type { FireflySocialMedia } from '@/providers/firefly/SocialMedia.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import { type Profile, type Provider } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

interface PagesData {
    pages: Array<{ data: Profile[] }>;
}

function setBlockStatus(source: SocialSource, profileId: string, status: boolean) {
    const matcher: Matcher = (post) => post?.author.profileId === profileId;
    patchPostQueryData(source, matcher, (draft) => {
        draft.author.viewerContext = {
            ...draft.author.viewerContext,
            blocking: status,
        };
    });

    const profilesPatcher = (oldData: Draft<PagesData> | undefined) => {
        if (!oldData) return oldData;
        return produce(oldData, (draft) => {
            for (const page of draft.pages) {
                if (!page) continue;
                for (const mutedProfile of page.data) {
                    if (mutedProfile.profileId !== profileId) continue;

                    mutedProfile.viewerContext = {
                        ...mutedProfile.viewerContext,
                        blocking: status,
                    };
                }
            }
        });
    };

    queryClient.setQueriesData<Profile>({ queryKey: ['profile', source] }, (old) => {
        if (!old || old.profileId !== profileId) return old;
        return produce(old, (draft) => {
            draft.viewerContext = {
                ...draft.viewerContext,
                blocking: status,
            };
        });
    });

    patchNotificationQueryDataOnAuthor(source, (profile) => {
        if (profile.profileId === profileId) {
            profile.viewerContext = {
                ...profile.viewerContext,
                blocking: status,
            };
        }
    });

    queryClient.setQueryData(['profile-is-blocked', source, profileId], status);
    queryClient.setQueryData(['profile-is-muted', source, profileId], status);
    queryClient.setQueriesData<PagesData>({ queryKey: ['profiles', source, 'muted-list'] }, profilesPatcher);
    queryClient.setQueriesData<PagesData>({ queryKey: ['suggested-follows', source], type: 'active' }, profilesPatcher);
    queryClient.refetchQueries({ queryKey: ['suggested-follows-lite', source] });
}

const METHODS_BE_OVERRIDDEN = ['blockProfile', 'unblockProfile'] as const;
const METHODS_BE_OVERRIDDEN_MUTE_ALL = ['muteProfileAll'] as const;

export function SetQueryDataForBlockProfile(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (profileId: string) => {
                    const m = method as (profileId: string) => Promise<boolean>;
                    const status = key === 'blockProfile';
                    try {
                        const result = await m?.call(target.prototype, profileId);
                        if (!result) {
                            // rolling back
                            setBlockStatus(source, profileId, !status);
                            return false;
                        }
                        setBlockStatus(source, profileId, status);
                        return result;
                    } catch (err) {
                        // rolling back
                        setBlockStatus(source, profileId, !status);
                        throw err;
                    }
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}

export function SetQueryDataForMuteAllProfiles() {
    return function decorator<T extends ClassType<FireflySocialMedia>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN_MUTE_ALL)[number]>(key: K) {
            const method = target.prototype[key] as FireflySocialMedia[K];

            Object.defineProperty(target.prototype, key, {
                value: async (identity: FireflyIdentity) => {
                    const m = method as (identity: FireflyIdentity) => ReturnType<FireflySocialMedia[K]>;
                    const relationships = await m.call(target.prototype, identity);
                    [...relationships, { snsId: identity.id, snsPlatform: identity.source }].forEach(
                        ({ snsId, snsPlatform }) => {
                            const source = resolveSourceFromUrl(snsPlatform);
                            queryClient.setQueryData(['profile', 'mute-all', source, snsId], true);

                            if (source !== Source.Wallet) {
                                setBlockStatus(narrowToSocialSource(source), snsId, true);
                            }
                        },
                    );

                    return relationships;
                },
            });
        }

        METHODS_BE_OVERRIDDEN_MUTE_ALL.forEach(overrideMethod);
        return target;
    };
}
