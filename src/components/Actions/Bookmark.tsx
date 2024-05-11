import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { useToggleBookmark } from '@/hooks/useToggleBookmark.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface BookmarkProps {
    count?: number;
    disabled?: boolean;
    post: Post;
}

export const Bookmark = memo<BookmarkProps>(function Bookmark({ count = 0, disabled = false, post }) {
    const { hasBookmarked } = post;

    const mutation = useToggleBookmark(post.source);

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center space-x-1 text-main md:space-x-2', {
                'cursor-not-allowed opacity-50': disabled,
            })}
            onClick={() => mutation.mutate(post)}
        >
            <motion.button
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                className="rounded-full p-1.5 hover:bg-warn/[.20] hover:text-warn"
                aria-label="Bookmark"
            >
                <Tooltip
                    disabled={disabled}
                    placement="top"
                    content={hasBookmarked ? t`Remove from Bookmarks` : t`Bookmark`}
                >
                    {hasBookmarked ? (
                        <BookmarkActiveIcon width={16} height={16} className="text-warn" />
                    ) : (
                        <BookmarkIcon width={16} height={16} />
                    )}
                </Tooltip>
            </motion.button>
            {count ? <span className="text-xs font-medium text-main">{nFormatter(count)}</span> : null}
        </ClickableArea>
    );
});
