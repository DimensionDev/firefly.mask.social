import { t, Trans } from '@lingui/macro';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';

import type { IImage } from '@/components/Compose/index.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { commentPostForLens, publishPostForLens, quotePostForLens } from '@/helpers/publishPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface ComposeSendProps {
    type: 'compose' | 'quote' | 'reply';
    characters: string;
    images: IImage[];
    setOpened: (opened: boolean) => void;
    setLoading: (loading: boolean) => void;
    post?: Post;
}
export default function ComposeSend({ type, characters, images, setOpened, setLoading, post }: ComposeSendProps) {
    const { enqueueSnackbar } = useSnackbar();

    const currentLensAccount = useLensStateStore.use.currentAccount();

    const charactersLen = useMemo(() => characters.length, [characters]);

    const disabled = useMemo(() => charactersLen > 280, [charactersLen]);

    const handleSend = useCallback(async () => {
        setLoading(true);
        if (currentLensAccount.id) {
            if (type === 'compose') {
                try {
                    await publishPostForLens(currentLensAccount.id, characters, images);
                    enqueueSnackbar(t`Posted on Lens`, {
                        variant: 'success',
                    });
                    setOpened(false);
                } catch {
                    enqueueSnackbar(t`Failed to post on Lens`, {
                        variant: 'error',
                    });
                }
            }

            if (type === 'reply') {
                if (!post) return;
                try {
                    await commentPostForLens(currentLensAccount.id, post.postId, characters, images);
                    enqueueSnackbar(t`Replying to @${currentLensAccount.handle || currentLensAccount.id} on Lens`, {
                        variant: 'success',
                    });
                    setOpened(false);
                } catch {
                    enqueueSnackbar(t`Replying to @${currentLensAccount.handle || currentLensAccount.id} on Lens`, {
                        variant: 'error',
                    });
                }
            }

            if (type === 'quote') {
                if (!post) return;
                try {
                    await quotePostForLens(currentLensAccount.id, post.postId, characters, images);
                    enqueueSnackbar(t`Quote on Lens`, {
                        variant: 'success',
                    });
                    setOpened(false);
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
        currentLensAccount.handle,
        currentLensAccount.id,
        enqueueSnackbar,
        images,
        post,
        setLoading,
        setOpened,
        type,
    ]);

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            <div className=" flex items-center gap-[10px]">
                {charactersLen >= 0 && charactersLen < 200 && (
                    <Image src="/svg/loading.green.svg" width={24} height={24} alt="loading.green" />
                )}

                {charactersLen >= 200 && charactersLen < 260 && (
                    <Image src="/svg/loading.yellow.svg" width={24} height={24} alt="loading.yellow" />
                )}

                {charactersLen >= 260 && <Image src="/svg/loading.red.svg" width={24} height={24} alt="loading.red" />}

                <span className={classNames(disabled ? ' text-danger' : '')}>{charactersLen} / 280</span>
            </div>

            <button
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black',
                    disabled ? ' cursor-no-drop opacity-50' : '',
                )}
                onClick={() => {
                    if (!disabled) {
                        handleSend();
                    }
                }}
            >
                <Image src="/svg/send.svg" width={18} height={18} alt="send" className=" h-[18px] w-[18px]" />
                <span>
                    <Trans>Send</Trans>
                </span>
            </button>
        </div>
    );
}
