import { t, Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { compact, first, sortBy, values } from 'lodash-es';
import { memo, useCallback, useMemo } from 'react';

import Trash from '@/assets/trash2.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { readChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { createInitPostState, type Draft, useComposeStateStore } from '@/store/useComposeStore.js';

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
                        REPLY
                        <span>
                            to <Link href={profileUrl}>@{post?.author.handle}</Link>
                        </span>
                    </Trans>
                );
            case 'quote':
                return <Trans>QUOTE</Trans>;
        }
    }, [draft]);

    const post = first(draft.posts);
    const content = post ? readChars(post.chars, true) : '';

    const isDisabled = useMemo(() => {
        const currentAllProfiles = compact(values(currentProfileAll));

        return !draft.avaialableProfiles.some((x) => currentAllProfiles.some((profile) => isSameProfile(profile, x)));
    }, [currentProfileAll, draft.avaialableProfiles]);

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
                <Trash className="h-5 w-5 cursor-pointer text-secondary" onClick={() => handleRemove(draft.id)} />
            </div>
            <div
                className={classNames('my-2 cursor-pointer text-fourMain', {
                    'text-third': isDisabled,
                })}
                onClick={() => {
                    if (isDisabled) {
                        enqueueErrorMessage(
                            t`Cannot choose due to account mismatch. Please login ${draft.avaialableProfiles
                                .map((x) => `@${x.handle}`)
                                .join(t` or `)}`,
                        );
                        return;
                    }

                    if (hasError) {
                        ConfirmModalRef.open({
                            title: t`Resend full or remaining?`,
                            content: (
                                <div className="text-main">
                                    Do you want to retry with the full or remaining content?
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
                <div className="line-clamp-5 break-words text-left text-[15px] leading-[24px]">{content}</div>
                <div className="text-left">
                    {compact([
                        post?.images.length ? t`[Photo]` : undefined,
                        post?.video ? t`[Video]` : undefined,
                        post?.rpPayload ? t`[LuckyDrop]` : undefined,
                    ]).join('')}
                </div>
            </div>
            <div className="flex gap-x-1">
                <span className="flex items-center gap-x-1 font-bold">
                    {post?.availableSources
                        .filter((x) => !!currentProfileAll[x] && SORTED_SOCIAL_SOURCES.includes(x))
                        .map((y) => <SocialSourceIcon key={y} source={y} size={20} />)}
                </span>
                <span className="text-[13px] font-medium leading-[24px] text-secondary">
                    {dayjs(draft.savedOn).format('DD MMM, YYYY [at] h:mm A')}
                </span>
            </div>
        </div>
    );
});

export const DraftList = memo(function DraftList() {
    const currentProfileAll = useCurrentProfileAll();
    const { drafts, removeDraft, applyDraft, updateChars } = useComposeStateStore();
    const setEditorContent = useSetEditorContent();

    const router = useRouter();
    const handleRemove = useCallback(
        async (id: string) => {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Delete`,
                content: t`This can’t be undone and you’ll lose your draft.`,
                confirmButtonText: t`Confirm`,
            });

            if (!confirmed) return;
            removeDraft(id);
        },
        [removeDraft],
    );

    const handleApply = useCallback(
        async (draft: Draft, full = false) => {
            const currentAllProfiles = compact(values(currentProfileAll));
            const avaialableProfiles = draft.avaialableProfiles.filter((x) =>
                currentAllProfiles.some((profile) => isSameProfile(profile, x)),
            );
            applyDraft({
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
                    availableSources: avaialableProfiles.map((x) => x.source),
                })),
            });
            const post = draft.posts.find((x) => x.id === draft.cursor);
            if (post) {
                updateChars(post.chars, post.id);
                setEditorContent(readChars(post.chars, true));
            }
            router.history.push('/');
        },
        [applyDraft, router, setEditorContent, updateChars, currentProfileAll],
    );

    if (!drafts.length) {
        return (
            <div className="min-h-[528px] flex flex-col justify-center">
                <NoResultsFallback className="h-full" />
            </div>
        );
    }

    return (
        <div className="min-h-[528px] px-6">
            {sortBy(drafts, (x) => {
                return dayjs(x.savedOn).unix();
            })
                .reverse()
                .map((draft) => (
                    <DraftListItem draft={draft} key={draft.id} handleRemove={handleRemove} handleApply={handleApply} />
                ))}
        </div>
    );
});
