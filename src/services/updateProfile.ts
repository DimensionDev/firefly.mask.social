import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Profile, UpdateProfileParams } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

function setCurrentProfileInPosts(profile: Pick<Profile, 'profileId' | 'source'>, params: UpdateProfileParams) {
    if (!profile) return;
    const matcher: Matcher = (post) => post?.author.profileId === profile.profileId;
    patchPostQueryData(profile.source, matcher, (draft) => {
        if (typeof params.displayName === 'string') draft.author.displayName = params.displayName;
        if (typeof params.bio === 'string') draft.author.bio = params.bio;
        if (typeof params.location === 'string') draft.author.location = params.location;
        if (typeof params.website === 'string') draft.author.website = params.website;
        if (params.pfp) draft.author.pfp = params.pfp;
    });
}

function updateCurrentProfileInState(source: SocialSource, params: UpdateProfileParams) {
    const stateStore = {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
    }[source];
    stateStore.getState().updateCurrentProfile(params);
}

export async function updateProfile(
    profile: Pick<Profile, 'handle' | 'profileId' | 'source' | 'displayName' | 'bio' | 'pfp' | 'website' | 'location'>,
    params: UpdateProfileParams,
) {
    switch (profile.source) {
        case Source.Farcaster:
            const diffUpdateParams: UpdateProfileParams = Object.keys(params).reduce<UpdateProfileParams>((acc, k) => {
                const key = k as keyof UpdateProfileParams;
                if (typeof params[key] === 'string' && params[key] !== profile[key]) acc[key] = params[key];
                return acc;
            }, {});
            await FarcasterSocialMediaProvider.updateProfile(diffUpdateParams);
            break;
        case Source.Lens:
            await LensSocialMediaProvider.updateProfile(params);
            break;
        case Source.Twitter:
            await TwitterSocialMediaProvider.updateProfile(params);
    }

    queryClient.setQueryData(['profile', profile.source, resolveFireflyProfileId(profile)], (old: Profile) => {
        if (!old) return old;
        return produce(old, (state: Profile) => {
            if (typeof params.displayName === 'string') state.displayName = params.displayName;
            if (typeof params.bio === 'string') state.bio = params.bio;
            if (typeof params.location === 'string') state.location = params.location;
            if (typeof params.website === 'string') state.website = params.website;
            state.pfp = params.pfp ?? getStampAvatarByProfileId(profile.source, profile.profileId);
        });
    });

    setCurrentProfileInPosts(profile, params);
    updateCurrentProfileInState(profile.source, params);
}
