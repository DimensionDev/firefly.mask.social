import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkActiveIcon } from '@heroicons/react/24/solid';
import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { useToggleBookmark } from '@/hooks/useToggleBookmark.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface BookmarkProps {
    count?: number;
    disabled?: boolean;
    post: Post;
}

export const Bookmark = memo<BookmarkProps>(function Bookmark({ count = 0, disabled = false, post }) {
    const { hasBookmarked } = post;

    const tooltip = count === 1 ? t`${humanize(count)} Bookmark` : t`${humanize(count)} Bookmarks`;
    const mutation = useToggleBookmark();

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center space-x-1 md:space-x-2', {
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
                <Tooltip disabled={disabled} placement="top" content={tooltip}>
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
