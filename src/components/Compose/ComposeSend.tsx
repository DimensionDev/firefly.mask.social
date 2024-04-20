import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Plural, t, Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import Send2Icon from '@/assets/send2.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { Tooltip } from '@/components/Tooltip.js';
import { MAX_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { measureChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { createMockPost } from '@/helpers/createMockPost.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import { isValidPost } from '@/helpers/isValidPost.js';
import { refreshComments } from '@/helpers/refreshComments.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { crossPost } from '@/services/crossPost.js';
import { crossPostThread } from '@/services/crossPostThread.js';
import { type CompositePost, useComposeStateStore, useCompositePost } from '@/store/useComposeStore.js';

interface ComposeSendProps extends React.HTMLAttributes<HTMLDivElement> {
    post: CompositePost;
}

export function ComposeSend({ post }: ComposeSendProps) {
    const { rootPost } = useCompositePost();
    const { type, posts, addPostInThread } = useComposeStateStore();

    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(rootPost.availableSources);
    const { visibleLength, invisibleLength } = measureChars(post.chars, rootPost.availableSources);

    const isMedium = useIsMedium();
    const setEditorContent = useSetEditorContent();

    const [{ loading }, handlePost] = useAsyncFn(async () => {
        if (posts.length > 1) await crossPostThread();
        else {
            const updatedPost = await crossPost(type, post);
            if (type === 'reply') {
                const source = post.availableSources[0];
                const parentPostId = post.parentPost[source]?.postId;
                if (parentPostId) {
                    const mockPost = createMockPost(source, updatedPost);
                    refreshComments(source, parentPostId, mockPost);
                }
            }
        }
        ComposeModalRef.close();
    }, [type, posts.length > 1, post]);

    const disabled =
        loading || posts.length > 1 ? posts.some((x) => !isValidPost(x, rootPost)) : !isValidPost(post, rootPost);

    if (!isMedium) {
        return (
            <ClickableButton
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer disabled:opacity-50"
                disabled={disabled}
                onClick={handlePost}
            >
                {loading ? (
                    <LoadingIcon width={24} height={24} className="animate-spin text-main" />
                ) : (
                    <Send2Icon width={24} height={24} />
                )}
            </ClickableButton>
        );
    }

    return (
        <div className=" flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {visibleLength ? (
                <div className=" flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle post={post} rootPost={rootPost} width={24} height={24} className="flex-shrink-0" />
                    <span className={visibleLength > MAX_CHAR_SIZE_PER_POST - invisibleLength ? ' text-danger' : ''}>
                        {visibleLength} / {MAX_CHAR_SIZE_PER_POST - invisibleLength}
                    </span>
                </div>
            ) : null}

            {visibleLength && type === 'compose' ? (
                <ClickableButton
                    className=" text-main disabled:opacity-50"
                    disabled={posts.length >= MAX_POST_SIZE_PER_THREAD}
                    onClick={() => {
                        addPostInThread();
                        setEditorContent('');
                    }}
                >
                    {posts.length >= MAX_POST_SIZE_PER_THREAD ? (
                        <PlusCircleIcon width={28} height={28} />
                    ) : (
                        <Tooltip content={t`Add`} placement="top">
                            <PlusCircleIcon width={28} height={28} />
                        </Tooltip>
                    )}
                </ClickableButton>
            ) : null}

            <ClickableButton
                disabled={disabled}
                className={classNames(
                    ' flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-black text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black',
                )}
                onClick={handlePost}
            >
                {loading ? (
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                ) : (
                    <>
                        <SendIcon width={18} height={18} className="mr-1 text-primaryBottom" />
                        <span>
                            <Plural value={posts.length} one={<Trans>Post</Trans>} other={<Trans>Post All</Trans>} />
                        </span>
                    </>
                )}
            </ClickableButton>
        </div>
    );
}
