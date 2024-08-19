import { safeUnreachable } from '@masknet/kit';
import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Profile, ProfileEditable } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

function setCurrentProfileInPosts(profile: Pick<Profile, 'profileId' | 'source'>, params: ProfileEditable) {
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

function updateCurrentProfileInState(source: SocialSource, params: ProfileEditable) {
    const stateStore = {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
    }[source];
    stateStore.getState().updateCurrentProfile(params);
}

export async function updateProfile(profile: Profile, profileEditable: ProfileEditable) {
    switch (profile.source) {
        case Source.Farcaster:
            const diffUpdateParams: ProfileEditable = Object.keys(profileEditable).reduce<ProfileEditable>((acc, k) => {
                const key = k as keyof ProfileEditable;
                if (typeof profileEditable[key] === 'string' && profileEditable[key] !== profile[key])
                    acc[key] = profileEditable[key];
                return acc;
            }, {});
            await FarcasterSocialMediaProvider.updateProfile(diffUpdateParams);
            break;
        case Source.Lens:
            await LensSocialMediaProvider.updateProfile(profileEditable);
            break;
        case Source.Twitter:
            await TwitterSocialMediaProvider.updateProfile(profileEditable);
            break;
        default:
            safeUnreachable(profile.source);
    }

    queryClient.setQueryData(['profile', profile.source, resolveFireflyProfileId(profile)], (old: Profile) => {
        if (!old) return old;
        return produce(old, (state: Profile) => {
            if (typeof profileEditable.displayName === 'string') state.displayName = profileEditable.displayName;
            if (typeof profileEditable.bio === 'string') state.bio = profileEditable.bio;
            if (typeof profileEditable.location === 'string') state.location = profileEditable.location;
            if (typeof profileEditable.website === 'string') state.website = profileEditable.website;
            state.pfp = profileEditable.pfp ?? getStampAvatarByProfileId(profile.source, profile.profileId);
        });
    });

    setCurrentProfileInPosts(profile, profileEditable);
    updateCurrentProfileInState(profile.source, profileEditable);
}
