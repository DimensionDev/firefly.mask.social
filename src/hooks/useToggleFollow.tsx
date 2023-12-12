import { Select } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

interface Options {
    platform: SocialPlatform;
    profileId: string;
    handle: string;
    isFollowed: boolean;
}
export function useToggleFollow({ profileId, handle, platform, isFollowed }: Options) {
    const isLogin = useIsLogin(platform);
    const enqueueSnackbar = useCustomSnackbar();
    return useAsyncFn(async () => {
        if (!profileId) return;
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        try {
            switch (platform) {
                case SocialPlatform.Lens:
                    await (isFollowed
                        ? LensSocialMediaProvider.unfollow(profileId)
                        : LensSocialMediaProvider.follow(profileId));
                    break;
                case SocialPlatform.Farcaster:
                    await (isFollowed
                        ? WarpcastSocialMediaProvider.unfollow(profileId)
                        : WarpcastSocialMediaProvider.follow(profileId));
                    break;
                default:
                    return;
            }
            enqueueSnackbar(
                <Select
                    value={isFollowed ? 'unfollow' : 'follow'}
                    _follow={`Followed @${handle} on ${platform}`}
                    _unfollow={`UnFollowed @${handle} on ${platform}`}
                    other={`Followed @${handle} on ${platform}`}
                />,
                {
                    variant: 'success',
                },
            );
            queryClient.invalidateQueries({ queryKey: ['discover', platform] });
            return;
        } catch (error) {
            if (error instanceof Error) {
                enqueueSnackbar(
                    <Select
                        value={isFollowed ? 'unfollow' : 'follow'}
                        _follow={`Failed to followed @${handle} on ${platform}`}
                        _unfollow={`Failed to unfollowed @${handle} on ${platform}`}
                        other={`Failed to followed @${handle} on ${platform}`}
                    />,
                    {
                        variant: 'error',
                    },
                );
            }
        }
    }, [isFollowed, isLogin, profileId, platform, handle]);
}
