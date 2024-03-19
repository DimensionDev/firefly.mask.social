import { Menu, Transition } from '@headlessui/react';
import { plural, t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { motion } from 'framer-motion';
import { Fragment, memo, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import MirrorIcon from '@/assets/mirror.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import QuoteDownIcon from '@/assets/quote-down.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
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

export const Mirror = memo<MirrorProps>(function Mirror({
    shares,
    source,

    postId,
    disabled = false,
    post,
}) {
    const isLogin = useIsLogin(source);

    const enqueueSnackbar = useCustomSnackbar();
    const [mirrored, setMirrored] = useState(post.hasMirrored);
    const [count, setCount] = useState(shares);

    const content = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return plural(count ?? 0, {
                    0: 'Mirror or Quote',
                    zero: 'Mirror or Quote',
                    one: 'Mirror or Quote',
                    other: 'Mirrors or Quotes',
                });
            case SocialPlatform.Farcaster:
                return t`Recast`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, count]);

    const mirrorActionText = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return mirrored ? t`Mirrored` : t`Mirror`;
            case SocialPlatform.Farcaster:
                return mirrored ? t`Cancel Recast` : t`Recast`;
            default:
                safeUnreachable(source);
                return '';
        }
    }, [source, mirrored]);

    const [{ loading }, handleMirror] = useAsyncFn(async () => {
        if (!postId) return null;

        switch (source) {
            case SocialPlatform.Lens:
                try {
                    setMirrored(true);
                    setCount((prev) => {
                        if (!prev) return;
                        return prev + 1;
                    });
                    const result = await LensSocialMediaProvider.mirrorPost(postId, { onMomoka: !!post.momoka?.proof });
                    enqueueSnackbar(t`Mirrored`, {
                        variant: 'success',
                    });
                    return result;
                } catch (error) {
                    if (error instanceof Error) {
                        setMirrored(false);
                        setCount((prev) => {
                            if (!prev) return;
                            return prev - 1;
                        });
                        enqueueSnackbar(t`Failed to mirror. ${error.message}`, {
                            variant: 'error',
                        });
                        return;
                    }
                    return;
                }
            case SocialPlatform.Farcaster:
                const originalStatus = mirrored;
                const originalCount = count;
                try {
                    setMirrored((prev) => !prev);
                    setCount((prev) => {
                        if (mirrored && prev) return prev - 1;
                        return (prev ?? 0) + 1;
                    });
                    await (mirrored
                        ? FarcasterSocialMediaProvider.unmirrorPost(postId, Number(post.author.profileId))
                        : FarcasterSocialMediaProvider.mirrorPost(postId, { authorId: Number(post.author.profileId) }));
                    enqueueSnackbar(mirrored ? t`Cancel recast successfully` : t`Recasted`, {
                        variant: 'success',
                    });
                    return;
                } catch (error) {
                    if (error instanceof Error) {
                        setMirrored(originalStatus);
                        setCount(originalCount);
                    }

                    return;
                }
            default:
                safeUnreachable(source);
                return null;
        }
    }, [postId, source, count, mirrored, post.author.profileId]);

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
                        className="flex items-center space-x-2 text-main hover:text-secondarySuccess"
                        whileTap={{ scale: 0.9 }}
                        onClick={async (event) => {
                            if (open) {
                                event.preventDefault();
                                close();
                            }

                            event.stopPropagation();
                            if (!isLogin && !loading) {
                                if (source === SocialPlatform.Lens) await getWalletClientRequired();
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
                            content={count && count > 0 ? `${humanize(count)} ${content}` : content}
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
                        {count ? (
                            <span
                                className={classNames('text-xs', {
                                    'font-medium': !mirrored && !post.hasQuoted,
                                    'font-bold': !!mirrored || !!post.hasQuoted,
                                    'text-secondarySuccess': !!mirrored || !!post.hasQuoted,
                                })}
                            >
                                {nFormatter(count)}
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
                                        <div
                                            className={classNames('flex cursor-pointer items-center space-x-2', {
                                                'text-secondarySuccess': !!mirrored,
                                            })}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                event.preventDefault();
                                                close();
                                                handleMirror();
                                            }}
                                        >
                                            <MirrorLargeIcon width={24} height={24} />
                                            <span className="font-medium">{mirrorActionText}</span>
                                        </div>
                                    )}
                                </Menu.Item>
                                {source === SocialPlatform.Lens ? (
                                    <Menu.Item>
                                        <div
                                            className="flex cursor-pointer items-center space-x-2"
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
