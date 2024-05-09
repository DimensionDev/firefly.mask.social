import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkActiveIcon } from '@heroicons/react/24/solid';
import { Trans } from '@lingui/macro';
import { forwardRef } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import type { Article } from '@/providers/types/Article.js';

interface Props extends Omit<ClickableButtonProps, 'children'> {
    busy?: boolean;
    article: Article;
    onConfirm?(): void;
    onToggleBookmark?(article: Article): void;
}

export const BookmarkButton = forwardRef<HTMLButtonElement, Props>(function BookmarkButton(
    { busy, article, className, onConfirm, onToggleBookmark, ...rest }: Props,
    ref,
) {
    const { hasBookmarked } = article;
    return (
        <ClickableButton
            className={classNames('flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg', className)}
            {...rest}
            onClick={async () => {
                rest.onClick?.();
                onToggleBookmark?.(article);
            }}
            ref={ref}
        >
            {busy ? (
                <LoadingIcon width={24} height={24} className="animate-spin text-danger" />
            ) : hasBookmarked ? (
                <BookmarkActiveIcon width={24} height={24} className="text-warn" />
            ) : (
                <BookmarkIcon width={24} height={24} />
            )}
            <span className="text-[17px] font-bold leading-[22px] text-main">
                {hasBookmarked ? <Trans>Unbookmark</Trans> : <Trans>Bookmark</Trans>}
            </span>
        </ClickableButton>
    );
});
