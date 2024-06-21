import { t, Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { compact, first, orderBy, values } from 'lodash-es';
import { memo, useCallback, useMemo } from 'react';

import Trash from '@/assets/trash2.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { readChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { type Draft, useComposeDraftStateStore } from '@/store/useComposeDraftStore.js';
import { createInitPostState, useComposeStateStore } from '@/store/useComposeStore.js';

interface DraftListItemProps {
    draft: Draft;
    handleRemove: (cursor: string) => Promise<void>;
    handleApply: (draft: Draft, full?: boolean) => void;
}

const DraftListItem = memo<DraftListItemProps>(function DraftListItem({ draft, handleRemove, handleApply }) {
    const currentProfileAll = useCurrentProfileAll();

    const title = useMemo(() => {
        const target = first(draft.posts);
        const parent = target?.parentPost;
        const post = parent?.Farcaster || parent?.Lens;
        switch (draft.type) {
            case 'compose':
                if (draft.posts.length > 1) return <Trans>THREAD POST</Trans>;
                return <Trans>POST</Trans>;
            case 'reply':
                const profileUrl = post ? getProfileUrl(post.author) : '';

                return (
                    <Trans>
                        REPLY to
                        <span className="ml-1">
                            <Link href={profileUrl}>@{post?.author.handle}</Link>
                        </span>
                    </Trans>
                );
            case 'quote':
                return <Trans>QUOTE</Trans>;
        }
    }, [draft]);

    const post = first(draft.posts);
    const content = post ? readChars(post.chars, 'visible') : '';

    const isDisabled = useMemo(() => {
        const currentAllProfiles = compact(values(currentProfileAll));

        return !draft.availableProfiles.some((x) => currentAllProfiles.some((profile) => isSameProfile(profile, x)));
    }, [currentProfileAll, draft.availableProfiles]);

    const hasError = draft.posts.some((x) => !!compact(values(x.postError)).length);

    return (
        <div className="border-b border-line py-3 last:border-b-0">
            <div className="flex items-center justify-between">
                <div
                    className={classNames('text-[12px] font-bold', {
                        'text-danger': hasError,
                        'text-secondary': !hasError,
                    })}
                >
                    {title}
                </div>
                <Trash className="h-5 w-5 cursor-pointer text-secondary" onClick={() => handleRemove(draft.draftId)} />
            </div>
            <div
                className={classNames('my-2 cursor-pointer text-fourMain', {
                    'text-third': isDisabled,
                })}
                onClick={() => {
                    if (isDisabled) {
                        enqueueErrorMessage(t`Cannot choose due to account mismatch.`);
                        return;
                    }

                    if (hasError && draft.posts.length > 1) {
                        ConfirmModalRef.open({
                            title: t`Resend full or remaining?`,
                            content: (
                                <div className="text-main">
                                    <Trans>Do you want to retry with the full or remaining content?</Trans>
                                </div>
                            ),
                            enableCancelButton: true,
                            cancelButtonText: t`Full`,
                            confirmButtonText: t`Remaining`,
                            variant: 'normal',
                            onCancel: () => {
                                handleApply(draft, true);
                            },
                            onConfirm: () => {
                                handleApply(draft);
                            },
                        });

                        return;
                    }

                    handleApply(draft);
                }}
            >
                <div className="line-clamp-5 min-h-[24px] break-words text-left text-[15px] leading-[24px]">
                    {content}
                </div>
                <div className="text-left">
                    {compact([
                        post?.images.length ? t`[Photo]` : undefined,
                        post?.video ? t`[Video]` : undefined,
                        post?.rpPayload ? t`[LuckyDrop]` : undefined,
                        post?.poll ? t`[Poll]` : undefined,
                    ]).join('')}
                </div>
            </div>
            <div className="flex gap-x-1">
                <span className="flex items-center gap-x-1 font-bold">
                    {post?.availableSources.map((y) => <SocialSourceIcon key={y} source={y} size={20} />)}
                </span>
                <span className="text-[13px] font-medium leading-[24px] text-secondary">
                    {dayjs(draft.createdAt).format('DD MMM, YYYY [at] h:mm A')}
                </span>
            </div>
        </div>
    );
});

export const DraftList = memo(function DraftList() {
    const currentProfileAll = useCurrentProfileAll();
    const { drafts, removeDraft } = useComposeDraftStateStore();
    const { updateChars, apply, draftId, clear } = useComposeStateStore();
    const setEditorContent = useSetEditorContent();

    const router = useRouter();
    const handleRemove = useCallback(
        async (id: string) => {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Delete`,
                content: (
                    <div className="text-fourMain">
                        <Trans>This can’t be undone and you’ll lose your draft.</Trans>
                    </div>
                ),
                confirmButtonText: t`Confirm`,
            });

            if (!confirmed) return;
            if (draftId) clear();
            removeDraft(id);
        },
        [removeDraft, draftId, clear],
    );

    const handleApply = useCallback(
        async (draft: Draft, full = false) => {
            if (draft.type === 'reply' || draft.type === 'quote') {
                const target = first(draft.posts);
                const post = first(compact(values(target?.parentPost)));

                if (post) {
                    const provider = resolveSocialMediaProvider(post.source);
                    const detail = await provider.getPostById(post.postId);
                    if (detail.isHidden) {
                        enqueueErrorMessage(t`The post you quoted/replied has already deleted`);
                        return;
                    }
                }
            }

            const currentAllProfiles = compact(values(currentProfileAll));
            const availableProfiles = draft.availableProfiles.filter((x) =>
                currentAllProfiles.some((profile) => isSameProfile(profile, x)),
            );
            apply({
                ...draft,
                posts: draft.posts.map((x) => ({
                    ...x,
                    ...(full
                        ? {
                              postId: createInitPostState(),
                              postError: createInitPostState(),
                              parentPost: createInitPostState(),
                          }
                        : {}),
                    availableSources: availableProfiles.map((x) => x.source),
                })),
            });
            const post = draft.posts.find((x) => x.id === draft.cursor);
            if (post) {
                updateChars(post.chars, post.id);
                setEditorContent(post.chars);
            }
            router.history.push('/');
        },
        [apply, router, setEditorContent, updateChars, currentProfileAll],
    );

    if (!drafts.length) {
        return (
            <div className="flex min-h-[528px] flex-col justify-center">
                <NoResultsFallback className="h-full" />
            </div>
        );
    }

    return (
        <div className="max-h-[818px] min-h-[582px] overflow-auto px-6">
            {orderBy(
                drafts,
                (x) => {
                    return dayjs(x.createdAt).unix();
                },
                'asc',
            )
                .reverse()
                .map((draft) => (
                    <DraftListItem
                        draft={draft}
                        key={draft.draftId}
                        handleRemove={handleRemove}
                        handleApply={handleApply}
                    />
                ))}
        </div>
    );
});
