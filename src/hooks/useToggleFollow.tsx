import { Select } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useAsyncFn } from 'react-use';

import { queryClient } from '@/configs/queryClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

interface Options {
    source: SocialPlatform;
    identifier: string;
    /** For notification */
    handle: string;
    isFollowed: boolean;
}
export function useToggleFollow({ identifier, handle, source, isFollowed }: Options) {
    const isLogin = useIsLogin(source);
    const enqueueSnackbar = useCustomSnackbar();
    return useAsyncFn(async () => {
        if (!identifier) return;
        if (!isLogin) {
            LoginModalRef.open();
            return;
        }
        try {
            switch (source) {
                case SocialPlatform.Lens:
                    await (isFollowed
                        ? LensSocialMediaProvider.unfollow(identifier)
                        : LensSocialMediaProvider.follow(identifier));
                    break;
                case SocialPlatform.Farcaster:
                    await (isFollowed
                        ? WarpcastSocialMediaProvider.unfollow(identifier)
                        : WarpcastSocialMediaProvider.follow(identifier));
                    break;
                default:
                    safeUnreachable(source);
                    return;
            }
            enqueueSnackbar(
                <Select
                    value={isFollowed ? 'unfollow' : 'follow'}
                    _follow={`Followed @${handle} on ${source}`}
                    _unfollow={`UnFollowed @${handle} on ${source}`}
                    other={`Followed @${handle} on ${source}`}
                />,
                {
                    variant: 'success',
                },
            );
            queryClient.invalidateQueries({ queryKey: ['discover', source] });
            return;
        } catch (error) {
            if (error instanceof Error) {
                enqueueSnackbar(
                    <Select
                        value={isFollowed ? 'unfollow' : 'follow'}
                        _follow={`Failed to followed @${handle} on ${source}`}
                        _unfollow={`Failed to unfollowed @${handle} on ${source}`}
                        other={`Failed to followed @${handle} on ${source}`}
                    />,
                    {
                        variant: 'error',
                    },
                );
            }
        }
    }, [isFollowed, isLogin, identifier, source, handle]);
}
