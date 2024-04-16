import { Menu, Transition } from '@headlessui/react';
import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fragment, memo, useMemo } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import MirrorIcon from '@/assets/mirror.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import QuoteDownIcon from '@/assets/quote-down.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Tooltip } from '@/components/Tooltip.js';
import { config } from '@/configs/wagmiClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface MirrorProps {
    shares?: number;

    source: SocialPlatform;
    postId: string;
    disabled?: boolean;
    post: Post;
}

export const Mirror = memo<MirrorProps>(function Mirror({ shares = 0, source, postId, disabled = false, post }) {
    const isLogin = useIsLogin(source);
    const queryClient = useQueryClient();
    const mirrored = post.hasMirrored;

    const content = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return plural(shares, {
                    0: 'Mirror or Quote',
                    zero: 'Mirror or Quote',
                    one: 'Mirror or Quote',
                    other: 'Mirrors or Quotes',
                });
            case SocialPlatform.Farcaster:
                return t`Recast`;
            case SocialPlatform.Twitter:
                return t`Retweet`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, shares]);

    const mirrorActionText = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return mirrored ? t`Mirrored` : t`Mirror`;
            case SocialPlatform.Farcaster:
                return mirrored ? t`Cancel Recast` : t`Recast`;
            case SocialPlatform.Twitter:
                return t`Retweet`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, mirrored]);

    const [{ loading }, handleMirror] = useAsyncFn(async () => {
        if (!postId) return;

        switch (source) {
            case SocialPlatform.Lens:
                try {
                    const result = await LensSocialMediaProvider.mirrorPost(postId, { onMomoka: !!post.momoka?.proof });
                    enqueueSuccessMessage(t`Mirrored`);
                    return result;
                } catch (error) {
                    if (error instanceof Error) {
                        enqueueErrorMessage(t`Failed to mirror. ${error.message}`);
                        return;
                    }
                    return;
                }
            case SocialPlatform.Farcaster:
                try {
                    await (mirrored
                        ? FarcasterSocialMediaProvider.unmirrorPost(postId, Number(post.author.profileId))
                        : FarcasterSocialMediaProvider.mirrorPost(postId, { authorId: Number(post.author.profileId) }));
                    enqueueSuccessMessage(mirrored ? t`Cancel recast successfully` : t`Recasted`);
                    return;
                } catch {
                    return;
                }
            case SocialPlatform.Twitter:
                throw new Error('Not implemented');
            default:
                safeUnreachable(source);
                return;
        }
    }, [postId, source, mirrored, queryClient, post.author.profileId]);

    return (
        <Menu
            as="div"
            className={classNames('relative text-main', {
                'text-secondarySuccess': !!mirrored,
                'opacity-50': !!disabled,
            })}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
            }}
        >
            {({ open, close }) => (
                <>
                    <Menu.Button
                        disabled={disabled}
                        as={motion.button}
                        className="flex items-center text-main hover:text-secondarySuccess md:space-x-2"
                        whileTap={{ scale: 0.9 }}
                        onClick={async (event) => {
                            if (open) {
                                event.preventDefault();
                                close();
                            }

                            event.stopPropagation();
                            if (!isLogin && !loading) {
                                if (source === SocialPlatform.Lens) await getWalletClientRequired(config);
                                LoginModalRef.open({ source: post.source });
                                return;
                            }
                            return;
                        }}
                        aria-label="Mirror"
                    >
                        <Tooltip
                            disabled={disabled}
                            className="rounded-full p-1.5 hover:bg-secondarySuccess/[.20]"
                            placement="top"
                            content={shares ? `${humanize(shares)} ${content}` : content}
                            withDelay
                        >
                            {loading ? (
                                <LoadingIcon width={16} height={16} className="animate-spin text-secondarySuccess" />
                            ) : (
                                <MirrorIcon
                                    width={16}
                                    height={16}
                                    className={mirrored || post.hasQuoted ? 'text-secondarySuccess' : ''}
                                />
                            )}
                        </Tooltip>
                        {shares ? (
                            <span
                                className={classNames('text-xs', {
                                    'font-medium': !mirrored && !post.hasQuoted,
                                    'font-bold': !!mirrored || !!post.hasQuoted,
                                    'text-secondarySuccess': !!mirrored || !!post.hasQuoted,
                                })}
                            >
                                {nFormatter(shares)}
                            </span>
                        ) : null}
                    </Menu.Button>

                    {!disabled && isLogin ? (
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items
                                className="absolute z-[5] mt-1 w-max space-y-2 rounded-2xl bg-primaryBottom px-4 py-2 text-main shadow-messageShadow hover:text-main"
                                static
                            >
                                <Menu.Item>
                                    {({ close }) => (
                                        <ClickableButton
                                            className={classNames('flex cursor-pointer items-center md:space-x-2', {
                                                'text-secondarySuccess': !!mirrored,
                                            })}
                                            onClick={() => {
                                                close();
                                                handleMirror();
                                            }}
                                        >
                                            <MirrorLargeIcon width={24} height={24} />
                                            <span className="font-medium">{mirrorActionText}</span>
                                        </ClickableButton>
                                    )}
                                </Menu.Item>
                                {source === SocialPlatform.Lens ? (
                                    <Menu.Item>
                                        <ClickableButton
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
                                        </ClickableButton>
                                    </Menu.Item>
                                ) : null}
                            </Menu.Items>
                        </Transition>
                    ) : null}
                </>
            )}
        </Menu>
    );
});
