import { Menu, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { Fragment, memo, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import MirrorIcon from '@/assets/mirror.svg';
import MirrorLargeIcon from '@/assets/mirror-large.svg';
import MirroredIcon from '@/assets/mirrored.svg';
import QuoteDownIcon from '@/assets/quote-down.svg';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { humanize, nFormatter } from '@/helpers/formatCommentCounts.js';
import { useLogin } from '@/hooks/useLogin.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface MirrorProps {
    shares?: number;
    hasMirrored?: boolean;
    source: SocialPlatform;
    postId: string;
    disabled?: boolean;
    post: Post;
}

export const Mirror = memo<MirrorProps>(function Mirror({
    shares,
    source,
    hasMirrored,
    postId,
    disabled = false,
    post,
}) {
    const [composeOpened, setComposeOpened] = useState(false);

    const isLogin = useLogin(source);

    const { enqueueSnackbar } = useSnackbar();
    const [mirrored, setMirrored] = useState(hasMirrored);
    const [count, setCount] = useState(shares);

    const content = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                if (count) return t`Mirrors and Quotes`;
                return t`Mirror and Quotes`;
            case SocialPlatform.Farcaster:
                return t`Recast`;
            default:
                return '';
        }
    }, [source, count]);

    const mirrorActionText = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return mirrored ? t`Mirrored` : t`Mirror`;
            case SocialPlatform.Farcaster:
                return mirrored ? t`Recasted` : t`Recast`;
            default:
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
                    const result = await LensSocialMediaProvider.mirrorPost(postId);
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
                // TODO cancel Recast
                return FireflySocialMediaProvider.mirrorPost(postId);
            default:
                return null;
        }
    }, [postId, source]);

    return (
        <>
            <Menu
                as="div"
                className={classNames('relative text-secondary', {
                    'text-secondarySuccess': !!mirrored,
                    'opacity-50': !!disabled,
                })}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                <Menu.Button
                    disabled={disabled}
                    as={motion.button}
                    className={'flex items-center space-x-2 text-secondary hover:text-secondarySuccess'}
                    whileTap={{ scale: 0.9 }}
                    onClick={(event) => {
                        if (!isLogin && !loading) {
                            event.stopPropagation();
                            event.preventDefault();
                            LoginModalRef.open({});
                            return;
                        }
                        return;
                    }}
                    aria-label="Mirror"
                >
                    <Tooltip
                        disabled={disabled}
                        className={'rounded-full p-1.5 hover:bg-secondarySuccess/[.20]'}
                        placement="top"
                        content={count && count > 0 ? `${humanize(count)} ${content}` : content}
                        withDelay
                    >
                        {loading ? (
                            <LoadingIcon width={16} height={16} className="animate-spin text-secondarySuccess" />
                        ) : mirrored ? (
                            <MirroredIcon width={16} height={16} />
                        ) : (
                            <MirrorIcon width={16} height={16} />
                        )}
                    </Tooltip>
                    {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
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
            </Menu>
        </>
    );
});
