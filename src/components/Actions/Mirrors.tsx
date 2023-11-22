import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
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
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

interface MirrorProps {
    shares?: number;
    hasMirrored?: boolean;
    source: SocialPlatform;
    postId: string;
}

export const Mirror = memo<MirrorProps>(function Mirror({ shares, source, hasMirrored, postId }) {
    const { enqueueSnackbar } = useSnackbar();
    const [mirrored, setMirrored] = useState(hasMirrored);
    const [count, setCount] = useState(shares);

    const content = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                if (count) return 'Mirrors and Quotes';
                return 'Mirror and Quotes';
            case SocialPlatform.Farcaster:
                return 'Recast';
            default:
                return '';
        }
    }, [source, count]);

    const mirrorActionText = useMemo(() => {
        switch (source) {
            case SocialPlatform.Lens:
                return mirrored ? 'Mirrored' : 'Mirror';
            case SocialPlatform.Farcaster:
                return mirrored ? 'Recasted' : 'Recast';
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
                    enqueueSnackbar('Mirrored', {
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
                        enqueueSnackbar(`Failed to mirror. ${error.message}`, {
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
        <Menu
            as="div"
            className={classNames('text-secondar relative', {
                'text-secondarySuccess': !!mirrored,
            })}
            onClick={(event) => event.stopPropagation()}
        >
            <Menu.Button
                as={motion.button}
                className="flex items-center space-x-2 hover:text-secondarySuccess"
                whileTap={{ scale: 0.9 }}
                onClick={(event) => event.stopPropagation()}
                aria-label="Mirror"
            >
                <Tooltip
                    className="rounded-full p-1.5 hover:bg-secondarySuccess/[.20]"
                    placement="top"
                    content={count && count > 0 ? `${humanize(count)} ${content}` : content}
                    withDelay
                >
                    {loading ? (
                        <LoadingIcon width={16} height={16} className="animate-spin text-secondarySuccess" />
                    ) : (
                        <MirrorIcon width={16} height={16} />
                    )}
                </Tooltip>
                {count ? <span className="text-xs font-medium">{nFormatter(count)}</span> : null}
            </Menu.Button>

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
                    className="absolute z-[5] mt-1 w-max space-y-2 rounded-2xl bg-primaryBottom px-2 py-4 text-main shadow-messageShadow hover:text-main"
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
                            <div className="flex cursor-pointer items-center space-x-2">
                                <QuoteDownIcon width={24} height={24} />
                                <span className="font-medium">Quote Post</span>
                            </div>
                        </Menu.Item>
                    ) : null}
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
