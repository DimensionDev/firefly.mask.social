import { t, Trans } from '@lingui/macro';
import { useCallback, useMemo } from 'react';

import SendIcon from '@/assets/send.svg';
import { classNames } from '@/helpers/classNames.js';
import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPost.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { IPFS_MediaObject } from '@/types/index.js';

import { CountdownCircle } from './CountdownCircle.js';

interface ComposeSendProps {
    type: 'compose' | 'quote' | 'reply';
    characters: string;
    images: IPFS_MediaObject[];
    closeCompose: () => void;
    setLoading: (loading: boolean) => void;
    post?: Post;
}
export default function ComposeSend({ type, characters, images, closeCompose, setLoading, post }: ComposeSendProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const currentLensProfile = useLensStateStore.use.currentProfile();

    const charactersLen = useMemo(() => characters.length, [characters]);

    const disabled = useMemo(() => charactersLen > 280, [charactersLen]);

    const handleSend = useCallback(async () => {
        setLoading(true);
        if (currentLensProfile?.profileId) {
            if (type === 'compose') {
                try {
                    await publishPostForLens(currentLensProfile?.profileId, characters, images);
                    enqueueSnackbar(t`Posted on Lens`, {
                        variant: 'success',
                    });
                    closeCompose();
                } catch {
                    enqueueSnackbar(t`Failed to post on Lens`, {
                        variant: 'error',
                    });
                }
            }

            if (type === 'reply') {
                if (!post) return;
                try {
                    await commentPostForLens(currentLensProfile?.profileId, post.postId, characters, images);
                    enqueueSnackbar(
                        t`Replying to @${currentLensProfile.handle || currentLensProfile?.profileId} on Lens`,
                        {
                            variant: 'success',
                        },
                    );
                    closeCompose();
                } catch {
                    enqueueSnackbar(
                        t`Replying to @${currentLensProfile.handle || currentLensProfile?.profileId} on Lens`,
                        {
                            variant: 'error',
                        },
                    );
                }
            }

            if (type === 'quote') {
                if (!post) return;
                try {
                    await quotePostForLens(currentLensProfile?.profileId, post.postId, characters, images);
                    enqueueSnackbar(t`Quote on Lens`, {
                        variant: 'success',
                    });
                    closeCompose();
                } catch {
                    enqueueSnackbar(t`Failed to quote on Lens`, {
                        variant: 'error',
                    });
                }
            }
        }
        setLoading(false);
    }, [
        characters,
        closeCompose,
        currentLensProfile?.handle,
        currentLensProfile?.profileId,
        enqueueSnackbar,
        images,
        post,
        setLoading,
        type,
    ]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                <CountdownCircle count={charactersLen} width={24} height={24} className="flex-shrink-0" />
                <span className={classNames(disabled ? ' text-danger' : '')}>{charactersLen} / 280</span>
            </div>

            <button
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white dark:bg-white dark:text-black',
                    disabled ? ' cursor-no-drop opacity-50' : '',
                )}
                onClick={() => {
                    if (!disabled) {
                        handleSend();
                    }
                }}
            >
                <SendIcon width={18} height={18} className=" text-main" />
                <span>
                    <Trans>Send</Trans>
                </span>
            </button>
        </div>
    );
}
