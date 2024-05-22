import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import MirrorIcon from '@/assets/mirror.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import QuoteDownIcon from '@/assets/quote-down.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface MirrorProps {
    shares?: number;
    source: SocialSource;
    postId: string;
    disabled?: boolean;
    post: Post;
}

export const Mirror = memo<MirrorProps>(function Mirror({ shares = 0, source, postId, disabled = false, post }) {
    const isLogin = useIsLogin(source);
    const queryClient = useQueryClient();
    const mirrored = !!post.hasMirrored;

    const content = useMemo(() => {
        switch (source) {
            case Source.Lens:
                return plural(shares, {
                    0: 'Mirror or Quote',
                    zero: 'Mirror or Quote',
                    one: 'Mirror or Quote',
                    other: 'Mirrors or Quotes',
                });
            case Source.Farcaster:
                return t`Recast`;
            case Source.Twitter:
                return t`Retweet`;
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
                return t`Retweet`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, mirrored]);

    const [{ loading }, handleMirror] = useAsyncFn(async () => {
        if (!postId) return;

        const mirror = async () => {
            switch (source) {
                case Source.Farcaster: {
                    const result = await (mirrored
                        ? FarcasterSocialMediaProvider.unmirrorPost(postId, Number(post.author.profileId))
                        : FarcasterSocialMediaProvider.mirrorPost(postId, { authorId: Number(post.author.profileId) }));
                    enqueueSuccessMessage(mirrored ? t`Cancel recast successfully` : t`Recasted`);
                    return result;
                }
                case Source.Lens: {
                    const result = await LensSocialMediaProvider.mirrorPost(postId);
                    // lens only supports mirroring
                    enqueueSuccessMessage(t`Mirrored`);
                    return result;
                }
                case Source.Twitter:
                    const result = await (mirrored
                        ? TwitterSocialMediaProvider.unmirrorPost(postId)
                        : TwitterSocialMediaProvider.mirrorPost(postId));
                    enqueueSuccessMessage(mirrored ? t`Cancel retweet successfully` : t`Retweeted`);
                    return result;
                default:
                    safeUnreachable(source);
                    return;
            }
        };

        try {
            await mirror();
        } catch (error) {
            switch (source) {
                case Source.Farcaster:
                    enqueueErrorMessage(t`Failed to recast.`, {
                        error,
                    });
                    break;
                case Source.Lens:
                    enqueueErrorMessage(t`Failed to mirror.`, {
                        error,
                    });
                    break;
                case Source.Twitter:
                    enqueueErrorMessage(t`Failed to retweet.`, {
                        error,
                    });
                    break;
                default:
                    safeUnreachable(source);
                    break;
            }
            throw error;
        }
    }, [postId, source, mirrored, queryClient, post.author.profileId]);

    return (
        <Tippy
            appendTo={() => document.body}
            offset={[-30, -6]}
            placement="top"
            className="tippy-card"
            duration={200}
            trigger="click"
            arrow={false}
            interactive
            content={
                <div className="z-[5] mt-1 space-y-2 rounded-2xl bg-primaryBottom px-4 py-2 text-main shadow-messageShadow hover:text-main">
                    <div
                        className={classNames('flex cursor-pointer items-center md:space-x-2', {
                            'text-secondarySuccess': mirrored,
                        })}
                        onClick={() => {
                            close();
                            handleMirror();
                        }}
                    >
                        <MirrorLargeIcon width={24} height={24} />
                        <span className="font-medium">{mirrorActionText}</span>
                    </div>
                    {source === Source.Lens ? (
                        <div
                            className="flex cursor-pointer items-center md:space-x-2"
                            onClick={() => {
                                close();
                                ComposeModalRef.open({
                                    type: 'quote',
                                    post,
                                    source,
                                });
                            }}
                        >
                            <QuoteDownIcon width={24} height={24} />
                            <span className="font-medium">
                                <Trans>Quote Post</Trans>
                            </span>
                        </div>
                    ) : null}
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
                    return;
                }}
                className={classNames(
                    'relative flex cursor-pointer items-center text-main hover:text-secondarySuccess',
                    {
                        'text-secondarySuccess': mirrored,
                        'opacity-50': !!disabled,
                    },
                )}
            >
                <Tooltip
                    disabled={disabled}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondarySuccess/[.20] "
                    placement="top"
                    content={shares ? `${humanize(shares)} ${content}` : content}
                    withDelay
                >
                    <MirrorIcon
                        width={16}
                        height={16}
                        className={mirrored || post.hasQuoted ? 'text-secondarySuccess' : ''}
                    />
                </Tooltip>
                {shares ? (
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
