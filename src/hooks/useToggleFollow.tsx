import { Select } from '@lingui/macro';
import { ClientError } from 'graphql-request';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useIsFollowing } from '@/hooks/useIsFollowing.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useUnmountRef } from '@/hooks/useUnmountRef.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useToggleFollow(profile: Profile) {
    const { profileId, handle, source } = profile;
    const isLogin = useIsLogin(source);
    const [touched, setTouched] = useState(false);
    // Request received, but state might not update yet.
    const [received, setReceived] = useState(false);

    const handleOrProfileId = profile.source === Source.Lens ? profile.handle : profile.profileId;
    const isMyProfile = useIsMyProfile(profile.source, handleOrProfileId);

    const previousIsFollowing = isMyProfile || !!profile?.viewerContext?.following;
    const [isFollowing, refresh] = useIsFollowing({
        profile,
        placeholder: previousIsFollowing,
        enabled: touched,
    });
    const followState = received ? !previousIsFollowing : isFollowing;
    const followStateRef = useRef(followState);
    useEffect(() => {
        followStateRef.current = followState;
    });
    const handleToggleFollow = useCallback(async () => {
        if (!profileId || isMyProfile) return;

        if (!isLogin) {
            LoginModalRef.open({ source });
            return;
        }

        try {
            const provider = resolveSocialMediaProvider(source);
            await (followStateRef.current ? provider.unfollow(profileId) : provider.follow(profileId));

            enqueueSuccessMessage(
                <Select
                    value={followStateRef.current ? 'unfollow' : 'follow'}
                    _follow={`Followed @${handle} on ${source}`}
                    _unfollow={`Unfollowed @${handle} on ${source}`}
                    other={`Followed @${handle} on ${source}`}
                />,
            );
            return;
        } catch (error) {
            if (error instanceof ClientError) {
                const message = error.response.errors?.[0]?.message;
                if (message) {
                    enqueueErrorMessage(message, {
                        error,
                    });
                    throw error;
                }
            }
            enqueueErrorMessage(
                <Select
                    value={followStateRef.current ? 'unfollow' : 'follow'}
                    _follow={`Failed to followed @${handle} on ${source}`}
                    _unfollow={`Failed to unfollowed @${handle} on ${source}`}
                    other={`Failed to followed @${handle} on ${source}`}
                />,
                {
                    error,
                },
            );
            throw error;
        }
    }, [profileId, isLogin, source, handle, isMyProfile]);

    const unmountRef = useUnmountRef();
    const [state, handleToggle] = useAsyncFn(async () => {
        setReceived(false);
        setTouched(true);
        await handleToggleFollow();
        if (unmountRef.current) return;
        setReceived(true);

        if (isLogin) {
            if (unmountRef.current) return;
            setTouched(true);
            await refresh();
        }

        if (unmountRef.current) return;
        setReceived(false);
    }, [handleToggleFollow, refresh, isLogin]);

    // Update optimistically after follow/unfollow request gets received
    return [followState, state, handleToggle] as const;
}
