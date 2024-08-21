import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo } from 'react';

import BookmarkActiveIcon from '@/assets/bookmark.selected.svg';
import BookmarkIcon from '@/assets/bookmark.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';

interface BookmarkProps {
    count?: number;
    disabled?: boolean;
    hasBookmarked?: boolean;
    hiddenCount?: boolean;
    onClick: () => void;
}

export const Bookmark = memo<BookmarkProps>(function Bookmark({
    count = 0,
    disabled = false,
    hasBookmarked,
    hiddenCount = false,
    onClick,
}) {
    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center space-x-1 text-lightSecond md:space-x-2', {
                'cursor-not-allowed opacity-50': disabled,
            })}
            onClick={onClick}
        >
            <Tooltip
                disabled={disabled}
                placement="top"
                content={hasBookmarked ? t`Remove from Bookmarks` : t`Bookmark`}
            >
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-warn/[.20] hover:text-warn"
                    aria-label="Bookmark"
                >
                    {hasBookmarked ? (
                        <BookmarkActiveIcon width={20} height={20} className="text-warn" />
                    ) : (
                        <BookmarkIcon width={20} height={20} />
                    )}
                </motion.button>
            </Tooltip>
            {!hiddenCount && count ? <span className="text-xs font-medium text-main">{nFormatter(count)}</span> : null}
        </ClickableArea>
    );
});
