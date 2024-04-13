import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { memo, useCallback, useMemo } from 'react';

import ReplyIcon from '@/assets/reply.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface CommentProps {
    count?: number;
    disabled?: boolean;
    source: SocialPlatform;
    author: string;
    canComment?: boolean;
    post: Post;
}

export const Comment = memo<CommentProps>(function Comment({
    count,
    disabled = false,
    source,
    author,
    canComment,
    post,
}) {
    const isLogin = useIsLogin(source);

    const tooltip = useMemo(() => {
        if (count && count > 0) {
            return t`${humanize(count)} Comments`;
        }
        return t`Comment`;
    }, [count]);

    const handleClick = useCallback(async () => {
        if (!isLogin) {
            if (source === SocialPlatform.Lens) await getWalletClientRequired(config);
            LoginModalRef.open({ source });
            return;
        }
        if (canComment) {
            ComposeModalRef.open({
                type: 'reply',
                post,
                source,
            });
        } else {
            enqueueErrorMessage(t`You cannot reply to @${author} on ${resolveSourceName(source)}.`);
        }
    }, [isLogin, canComment, post, author, source]);

    return (
        <ClickableArea
            className={classNames('flex cursor-pointer items-center space-x-1 md:space-x-2', {
                'cursor-not-allowed': disabled,
                'opacity-50': disabled,
            })}
            onClick={() => {
                if (!disabled) handleClick();
            }}
        >
            <motion.button
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                className="rounded-full p-1.5 text-main hover:bg-bg focus:outline-none focus-visible:outline-none"
                aria-label="Comment"
            >
                <Tooltip disabled={disabled} placement="top" content={tooltip}>
                    <ReplyIcon width={16} height={16} />
                </Tooltip>
            </motion.button>
            {count ? <span className="text-xs font-medium text-main">{nFormatter(count)}</span> : null}
        </ClickableArea>
    );
});
