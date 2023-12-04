import { t } from '@lingui/macro';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useMemo, useState } from 'react';

import ReplyIcon from '@/assets/reply.svg';
import Compose from '@/components/Compose/index.js';
import { Tooltip } from '@/components/Tooltip.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { useLogin } from '@/hooks/useLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
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
    const [composeOpened, setComposeOpened] = useState(false);

    const isLogin = useLogin(source);

    const { enqueueSnackbar } = useSnackbar();
    const tooltip = useMemo(() => {
        if (count && count > 0) {
            return t`${humanize(count)} Comments`;
        }
        return t`Comment`;
    }, [count]);

    const handleClick = useCallback(() => {
        if (!isLogin) {
            LoginModalRef.open({});
            return;
        }
        if (canComment) {
            setComposeOpened(true);
        } else {
            enqueueSnackbar(t`You cannot reply to @${author} on ${source}`, {
                variant: 'error',
            });
        }
    }, [canComment, author, source, enqueueSnackbar, isLogin]);

    return (
        <>
            <div
                className={classNames('flex items-center space-x-2', {
                    'cursor-not-allowed': disabled,
                    'opacity-50': disabled,
                })}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                <motion.button
                    disabled={disabled}
                    whileTap={{ scale: 0.9 }}
                    className={'rounded-full p-1.5 text-secondary hover:bg-bg'}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!disabled) handleClick();
                    }}
                    aria-label="Comment"
                >
                    <Tooltip disabled={disabled} placement="top" content={tooltip}>
                        <ReplyIcon width={16} height={16} />
                    </Tooltip>
                </motion.button>
                {count ? <span className="text-xs font-medium text-secondary">{nFormatter(count)}</span> : null}
            </div>

            <Compose type="reply" opened={composeOpened} setOpened={setComposeOpened} post={post} />
        </>
    );
});
