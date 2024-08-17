import { produce } from 'immer';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { getStampAvatarByProfileId } from '@/helpers/getStampAvatarByProfileId.js';
import { type Matcher, patchPostQueryData } from '@/helpers/patchPostQueryData.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Profile, UpdateProfileParams } from '@/providers/types/SocialMedia.js';

function setCurrentProfileInPosts(profile: Pick<Profile, 'profileId' | 'source'>, params: UpdateProfileParams) {
    if (!profile) return;
    const matcher: Matcher = (post) => post?.author.profileId === profile.profileId;
    patchPostQueryData(profile.source, matcher, (draft) => {
        draft.author.displayName = params.displayName;
        draft.author.bio = params.bio;
    });
}

export async function updateProfile(
    profile: Pick<Profile, 'handle' | 'profileId' | 'source'>,
    params: UpdateProfileParams,
) {
    switch (profile.source) {
        case Source.Farcaster:
            await FarcasterSocialMediaProvider.updateProfile(params);
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
            state.displayName = params.displayName;
            state.bio = params.bio;
            state.website = params.website;
            state.pfp = params.avatar ?? getStampAvatarByProfileId(profile.source, profile.profileId);
        });
    });

    setCurrentProfileInPosts(profile, params);
}
