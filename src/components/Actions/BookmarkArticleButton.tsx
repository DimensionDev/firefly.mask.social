import { Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { type ClickableButtonProps } from '@/components/ClickableButton.js';
import type { Article } from '@/providers/types/Article.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    article: Article;
    onConfirm?(): void;
    onToggleBookmark?(article: Article): void;
}

export const BookmarkArticleButton = forwardRef<HTMLButtonElement, Props>(function BookmarkArticleButton(
    { busy, article, onConfirm, onToggleBookmark, ...rest }: Props,
    ref,
) {
    const { hasBookmarked } = article;
    return (
        <MenuButton
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                onToggleBookmark?.(article);
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
