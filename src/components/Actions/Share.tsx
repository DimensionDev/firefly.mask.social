import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { type HTMLProps, memo } from 'react';
import urlcat from 'urlcat';

import ShareIcon from '@/assets/share.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SITE_URL } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { useCopyText } from '@/hooks/useCopyText.js';
import { capturePostActionEvent } from '@/providers/telemetry/capturePostActionEvent.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface ShareProps extends HTMLProps<HTMLDivElement> {
    post: Post;
    disabled?: boolean;
}
export const Share = memo<ShareProps>(function Collect({ className, post, disabled = false }) {
    const url = urlcat(SITE_URL, getPostUrl(post));
    const [, handleCopy] = useCopyText(url);

    return (
        <ClickableArea
            className={classNames(
                'flex flex-auto items-center space-x-2 self-auto justify-self-auto text-lightSecond',
                className,
                {
                    'opacity-50': disabled,
                },
            )}
        >
            <Tooltip content={t`Share`} placement="top" disabled={disabled}>
                <motion.button
                    disabled={disabled}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (!disabled) handleCopy();
                        capturePostActionEvent('share', post);
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-link/[0.2] hover:text-link"
                >
                    <ShareIcon width={17} height={16} />
                </motion.button>
            </Tooltip>
        </ClickableArea>
    );
});
