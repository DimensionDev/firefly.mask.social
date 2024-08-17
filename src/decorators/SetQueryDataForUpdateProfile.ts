import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import type { Profile, Provider, UpdateProfileParams } from '@/providers/types/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

const METHODS_BE_OVERRIDDEN = ['updateProfile'] as const;

export function setProfile(source: SocialSource, params: UpdateProfileParams) {
    const currentProfile = getCurrentProfile(source);
    if (!currentProfile) return;

    queryClient.setQueryData(['profile', source, resolveFireflyProfileId(currentProfile)], (old: Profile) => {
        return produce(old, (state: Profile) => {
            state.displayName = params.displayName;
            state.bio = params.bio;
            state.website = params.website;
            state.pfp = params.avatar ?? getStampAvatarByProfileId(source, currentProfile.profileId);
        });
    });
}

export function SetQueryDataForUpdateProfile(source: SocialSource) {
    return function decorator<T extends ClassType<Provider>>(target: T): T {
        function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
            const method = target.prototype[key] as Provider[K];

            Object.defineProperty(target.prototype, key, {
                value: async (params: UpdateProfileParams) => {
                    const m = method as (params: UpdateProfileParams) => Promise<boolean>;
                    const result = await m.apply(target.prototype, [params]);
                    setProfile(source, params);
                    return result;
                },
            });
        }

        METHODS_BE_OVERRIDDEN.forEach(overrideMethod);
        return target;
    };
}
