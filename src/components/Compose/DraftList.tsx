import { t, Trans } from '@lingui/macro';
import { useRouter } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { compact, first } from 'lodash-es';
import { memo, useCallback, useMemo } from 'react';

import Trash from '@/assets/trash2.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { readChars } from '@/helpers/chars.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfileAll.js';
import { useSetEditorContent } from '@/hooks/useSetEditorContent.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { type Draft, useComposeStateStore } from '@/store/useComposeStore.js';

interface DraftListItemProps {
    draft: Draft;
    handleRemove: (cursor: string) => Promise<void>;
    handleApply: (draft: Draft) => void;
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
    const content = first(draft.posts)?.chars.toString();

    return (
        <div className="border-b border-line py-3 last:border-b-0">
            <div className="flex items-center justify-between">
                <div className="text-[12px] font-bold text-secondary">{title}</div>
                <Trash className="h-5 w-5 cursor-pointer text-secondary" onClick={() => handleRemove(draft.cursor)} />
            </div>
            <div className="my-2 cursor-pointer" onClick={() => handleApply(draft)}>
                <div className="line-clamp-5 break-words text-left text-[15px] leading-[24px]">{content}</div>
                <div className="text-left">
                    {compact([
                        post?.images.length ? t`[photo]` : undefined,
                        post?.video ? t`[video]` : undefined,
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
    const { drafts, removeDraft, applyDraft, updateChars, cursor } = useComposeStateStore();

    const setEditorContent = useSetEditorContent();

    const router = useRouter();
    const handleRemove = useCallback(
        async (cursor: string) => {
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Delete`,
                content: t`This can’t be undone and you’ll lose your draft.`,
                confirmButtonText: t`Confirm`,
            });

            if (!confirmed) return;
            removeDraft(cursor);
        },
        [removeDraft],
    );

    const handleApply = useCallback(
        (draft: Draft) => {
            applyDraft(draft);
            const post = draft.posts.find((x) => x.id === cursor);
            if (post) {
                updateChars(post.chars);
                setEditorContent(readChars(post.chars, true));
            }
            router.history.push('/');
        },
        [applyDraft, router, cursor, setEditorContent, updateChars],
    );

    return (
        <div className="min-h-[528px] px-6">
            {drafts.map((draft) => (
                <DraftListItem draft={draft} key={draft.cursor} handleRemove={handleRemove} handleApply={handleApply} />
            ))}
        </div>
    );
});
