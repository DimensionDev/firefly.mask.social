import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { motion } from 'framer-motion';
import { memo, useMemo, useState } from 'react';

import MirrorIcon from '@/assets/mirror.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import QuoteDownIcon from '@/assets/quote-down.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useMirror } from '@/hooks/useMirror.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface MirrorProps {
    shares?: number;
    source: SocialSource;
    postId: string;
    disabled?: boolean;
    post: Post;
    hiddenCount?: boolean;
}

export const Mirror = memo<MirrorProps>(function Mirror({
    shares = 0,
    source,
    postId,
    disabled = false,
    post,
    hiddenCount = false,
}) {
    const [open, setOpen] = useState(false);
    const isLogin = useIsLogin(source);
    const mirrored = !!post.hasMirrored;

    const content = useMemo(() => {
        if (shares === 0) {
            switch (source) {
                case Source.Lens:
                    return t`Mirror or Quote`;
                case Source.Farcaster:
                    return t`Recast or Quote`;
                case Source.Twitter:
                    return t`Repost`;
                default:
                    safeUnreachable(source);
                    return '';
            }
        }

        switch (source) {
            case Source.Lens:
                return plural(shares, {
                    one: 'Mirror or Quote',
                    other: 'Mirrors or Quotes',
                });
            case Source.Farcaster:
                return plural(shares, {
                    one: 'Recast or Quote',
                    other: 'Recasts or Quotes',
                });
            case Source.Twitter:
                return t`Repost`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, shares]);

    const mirrorActionText = useMemo(() => {
        switch (source) {
            case Source.Lens:
                return mirrored ? t`Mirror again` : t`Mirror`;
            case Source.Farcaster:
                return mirrored ? t`Cancel Recast` : t`Recast`;
            case Source.Twitter:
                return t`Repost`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, mirrored]);

    const [{ loading }, handleMirror] = useMirror(post);

    return (
        <Tippy
            visible={open}
            onClickOutside={() => setOpen(false)}
            appendTo={() => document.body}
            offset={[-30, -2]}
            placement="top"
            className="tippy-card"
            duration={200}
            arrow={false}
            interactive
            content={
                <div className="z-[5] mt-1 space-y-2 rounded-2xl bg-primaryBottom px-4 py-2 text-main shadow-messageShadow hover:text-main">
                    <div
                        className={classNames('flex cursor-pointer items-center space-x-1 md:space-x-2', {
                            'text-secondarySuccess': mirrored,
                        })}
                        onClick={() => {
                            setOpen(false);
                            handleMirror();
                        }}
                    >
                        <MirrorLargeIcon width={18} height={18} />
                        <span className="font-medium">{mirrorActionText}</span>
                    </div>

                    <div
                        className="flex cursor-pointer items-center space-x-1 md:space-x-2"
                        onClick={() => {
                            setOpen(false);
                            ComposeModalRef.open({
                                type: 'quote',
                                post,
                                source,
                            });
                        }}
                    >
                        <QuoteDownIcon width={17} height={17} />
                        <span className="font-medium">
                            <Trans>Quote Post</Trans>
                        </span>
                    </div>
                </div>
            }
        >
            <motion.div
                whileTap={{ scale: 0.9 }}
                aria-label="Mirror"
                onClick={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (!isLogin && !loading) {
                        if (source === Source.Lens) await getWalletClientRequired(config);
                        LoginModalRef.open({ source: post.source });
                        return;
                    }
                    setOpen(true);
                    return;
                }}
                className={classNames(
                    'relative flex w-min cursor-pointer items-center text-lightSecond hover:text-secondarySuccess md:space-x-2',
                    {
                        'text-secondarySuccess': mirrored,
                        'opacity-50': !!disabled,
                    },
                )}
            >
                <Tooltip
                    disabled={disabled || open}
                    placement="top"
                    content={shares ? `${humanize(shares)} ${content}` : content}
                >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondarySuccess/[.20]">
                        <MirrorIcon
                            width={16}
                            height={16}
                            className={mirrored || post.hasQuoted ? 'text-secondarySuccess' : ''}
                        />
                    </span>
                </Tooltip>
                {!hiddenCount && shares ? (
                    <span
                        className={classNames('text-xs', {
                            'font-medium': !mirrored && !post.hasQuoted,
                            'font-bold text-secondarySuccess': mirrored || !!post.hasQuoted,
                        })}
                    >
                        {nFormatter(shares)}
                    </span>
                ) : null}
            </motion.div>
        </Tippy>
    );
});
