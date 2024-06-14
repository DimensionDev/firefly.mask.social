import { Plural, t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { compact, values } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import AddThread from '@/assets/addThread.svg';
import LoadingIcon from '@/assets/loading.svg';
import SendIcon from '@/assets/send.svg';
import Send2Icon from '@/assets/send2.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CountdownCircle } from '@/components/Compose/CountdownCircle.js';
import { Tooltip } from '@/components/Tooltip.js';
import { MAX_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { Tippy } from '@/esm/Tippy.js';
import { measureChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentPostLimits } from '@/helpers/getCurrentPostLimits.js';
import { isValidPost } from '@/helpers/isValidPost.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useCheckPostMedias } from '@/hooks/useCheckPostMedias.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { crossPost } from '@/services/crossPost.js';
import { crossPostThread } from '@/services/crossPostThread.js';
import { useComposeDraftStateStore } from '@/store/useComposeDraftStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface ComposeSendProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ComposeSend(props: ComposeSendProps) {
    const { type, posts, addPostInThread, draftId } = useComposeStateStore();
    const { removeDraft } = useComposeDraftStateStore();
    const post = useCompositePost();

    const { MAX_CHAR_SIZE_PER_POST } = getCurrentPostLimits(post.availableSources);
    const { visibleLength, invisibleLength } = measureChars(post.chars, post.availableSources, post.poll);

    const isMedium = useIsMedium();
    const setEditorContent = useSetEditorContent();
    const checkPostMedias = useCheckPostMedias();

    const hasThread = (post.images.length > 0 || visibleLength) && type === 'compose';

    const [percentage, setPercentage] = useState(0);
    const [{ loading, error }, handlePost] = useAsyncFn(
        async (isRetry = false) => {
            if (checkPostMedias()) return;
            if (posts.length > 1) {
                await crossPostThread({
                    isRetry,
                    progressCallback: setPercentage,
                });
            } else {
                await crossPost(type, post, {
                    isRetry,
                });
            }
            await delay(300);
            // If the draft is applied and sent successfully, remove the draft.
            if (draftId) removeDraft(draftId);
            ComposeModalRef.close();
        },
        [type, post, posts.length > 1, checkPostMedias, draftId, removeDraft],
    );

    const hasError = useMemo(() => {
        return posts.some((x) => !!compact(values(x.postError)).length);
    }, [posts]);

    const disabled = loading || (posts.length > 1 ? posts.some((x) => !isValidPost(x)) : !isValidPost(post));

    if (!isMedium) {
        return (
            <>
                {posts.length > 1 && loading ? (
                    <span
                        className="bg fixed left-0 top-0 z-50 h-1 w-full bg-black/50 duration-100 dark:bg-white/50"
                        style={{
                            transform: `scaleX(${percentage})`,
                            transformOrigin: 'left',
                        }}
                    />
                ) : null}
                <ClickableButton
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                    disabled={disabled}
                    onClick={() => handlePost(!!hasError)}
                >
                    {loading ? (
                        <LoadingIcon width={24} height={24} className="animate-spin text-main" />
                    ) : (
                        <Send2Icon
                            className={classNames('text-tabLine', {
                                'text-commonDanger': hasError,
                                'text-third': hasError,
                            })}
                            width={24}
                            height={24}
                        />
                    )}
                </ClickableButton>
            </>
        );
    }

    return (
        <div className="flex h-[68px] items-center justify-end gap-4 px-4 shadow-send">
            {visibleLength && post.availableSources.length ? (
                <div className="flex items-center gap-[10px] whitespace-nowrap text-[15px] text-main">
                    <CountdownCircle width={24} height={24} className="flex-shrink-0" />
                    <span className={visibleLength > MAX_CHAR_SIZE_PER_POST - invisibleLength ? 'text-danger' : ''}>
                        {visibleLength} / {MAX_CHAR_SIZE_PER_POST - invisibleLength}
                    </span>
                </div>
            ) : null}

            {hasThread ? (
                <ClickableButton
                    className="text-main"
                    disabled={posts.length >= MAX_POST_SIZE_PER_THREAD}
                    onClick={() => {
                        addPostInThread();
                        setEditorContent('');
                    }}
                >
                    {posts.length >= MAX_POST_SIZE_PER_THREAD ? (
                        <AddThread width={40} height={40} />
                    ) : (
                        <Tooltip content={t`Add`} placement="top">
                            <AddThread width={40} height={40} />
                        </Tooltip>
                    )}
                </ClickableButton>
            ) : null}

            <Tippy
                appendTo={() => document.body}
                className="tippy-card"
                placement="bottom"
                duration={500}
                delay={500}
                arrow={false}
                trigger="mouseenter"
                interactive
                disabled={!hasError && posts.length > 1}
                content={
                    <div className="flex flex-col rounded-lg bg-tooltipBg px-3 py-1 opacity-80">
                        {post.availableSources.map((x) => {
                            const name = resolveSourceName(x);
                            const errorIndex = posts.findIndex((post) => post.postError[x]);

                            if (errorIndex === -1) return null;

                            return (
                                <div className="flex gap-x-1" key={x}>
                                    <span>{name}</span>
                                    <span className="text-commonDanger">
                                        {errorIndex} / {posts.length}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                }
            >
                <ClickableButton
                    disabled={disabled}
                    className={classNames(
                        'relative flex h-10 w-[120px] items-center justify-center gap-1 overflow-hidden rounded-full bg-black text-[15px] font-bold text-white dark:bg-white dark:text-black',
                        {
                            'bg-commonDanger': !!hasError,
                        },
                    )}
                    onClick={() => {
                        handlePost(!!hasError);
                    }}
                >
                    {posts.length > 1 && loading ? (
                        <span
                            className="absolute left-0 top-0 z-10 h-full w-full bg-white/50 duration-100 dark:bg-black/50"
                            style={{
                                transform: `scaleX(${percentage})`,
                                transformOrigin: 'left',
                            }}
                        />
                    ) : null}
                    {loading ? (
                        <>
                            <LoadingIcon width={16} height={16} className="animate-spin" />
                            <span>
                                <Trans>Posting...</Trans>
                            </span>
                        </>
                    ) : hasError ? (
                        <>
                            <SendIcon width={18} height={18} className="mr-1 text-primaryBottom" />
                            <span>
                                <Trans>Retry</Trans>
                            </span>
                        </>
                    ) : (
                        <>
                            <SendIcon width={18} height={18} className="mr-1 text-primaryBottom" />
                            <span>
                                <Plural
                                    value={posts.length}
                                    one={<Trans>Post</Trans>}
                                    other={<Trans>Post All</Trans>}
                                />
                            </span>
                        </>
                    )}
                </ClickableButton>
            </Tippy>
        </div>
    );
}
