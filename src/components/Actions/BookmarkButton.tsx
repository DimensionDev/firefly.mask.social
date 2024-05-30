import { Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import { useToggleBookmark } from '@/hooks/useToggleBookmark.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    post: Post;
    onConfirm?(): void;
}

export const BookmarkButton = forwardRef<HTMLButtonElement, Props>(function BookmarkButton(
    { post, onConfirm, ...rest }: Props,
    ref,
) {
    const mutation = useToggleBookmark(post.source);
    const { hasBookmarked } = post;
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                await mutation.mutateAsync(post);
                rest.onClick?.();
            }}
            ref={ref}
        >
            {hasBookmarked ? (
                <BookmarkActiveIcon width={24} height={24} className="text-warn" />
            ) : (
                <BookmarkIcon width={24} height={24} />
            )}
            <span className="font-bold leading-[22px] text-main">
                {hasBookmarked ? <Trans>Remove from Bookmarks</Trans> : <Trans>Bookmark</Trans>}
            </span>
        </MenuButton>
    );
});
