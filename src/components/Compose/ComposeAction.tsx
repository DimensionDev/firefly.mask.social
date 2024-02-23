import { Popover } from '@headlessui/react';
import { BugAntIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { delay, safeUnreachable } from '@masknet/kit';
import { CrossIsolationMessages } from '@masknet/shared-base';
import { $getSelection } from 'lexical';
import { compact } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import AtIcon from '@/assets/at.svg';
import GalleryIcon from '@/assets/gallery.svg';
import NumberSignIcon from '@/assets/number-sign.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import Media from '@/components/Compose/Media.js';
import PostBy from '@/components/Compose/PostBy.js';
import ReplyRestriction from '@/components/Compose/ReplyRestriction.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { PluginDebuggerMessages } from '@/mask/message-host/index.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface ComposeActionProps {}

export default function ComposeAction(props: ComposeActionProps) {
    const [restriction, setRestriction] = useState(0);

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();

    const { type, post, images, video, availableSources, currentSource } = useComposeStateStore();

    const [editor] = useLexicalComposerContext();

    const insertText = useCallback(
        (text: string) => {
            editor.update(() => {
                $getSelection()?.insertText(text);
            });
        },
        [editor],
    );

    const postBy = useMemo(() => {
        if (!post) {
            return compact(
                availableSources.map((x) => {
                    switch (x) {
                        case SocialPlatform.Lens:
                            return currentLensProfile?.source;
                        case SocialPlatform.Farcaster:
                            return currentFarcasterProfile?.source;
                        default:
                            safeUnreachable(x);
                            return;
                    }
                }),
            );
        } else {
            return [post.source];
        }
    }, [availableSources, post, currentLensProfile, currentFarcasterProfile]);

    const [{ loading }, openRedPacketComposeDialog] = useAsyncFn(async () => {
        await connectMaskWithWagmi();
        // import dynamically to avoid the start up dependency issue of mask packages
        await import('@/helpers/setupCurrentVisitingProfile.js').then((module) =>
            module.setupCurrentVisitingProfileAsFireflyApp(),
        );
        await delay(300);
        CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({
            open: true,
            fireflyContext: {
                currentLensProfile: currentLensProfile
                    ? {
                          ...currentLensProfile,
                          ownedBy: currentLensProfile.ownedBy?.address,
                      }
                    : undefined,
                currentFarcasterProfile: currentFarcasterProfile
                    ? {
                          ...currentFarcasterProfile,
                          ownedBy: currentFarcasterProfile.ownedBy?.address,
                      }
                    : undefined,
            },
        });
    }, [currentLensProfile, currentFarcasterProfile, lensProfiles, farcasterProfiles]);

    const maxImageCount = currentFarcasterProfile ? 2 : 4;

    const mediaDisabled = !!video || images.length >= maxImageCount;

    return (
        <div className=" px-4 pb-4">
            <div className=" relative flex h-9 items-center gap-3">
                <Popover as="div" className="relative">
                    {({ close }) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <Tooltip content={t`Media`} placement="top">
                                    <GalleryIcon
                                        className={classNames(
                                            ' text-main',
                                            mediaDisabled ? ' cursor-no-drop opacity-50' : ' cursor-pointer',
                                        )}
                                        width={24}
                                        height={24}
                                    />
                                </Tooltip>
                            </Popover.Button>

                            {!mediaDisabled ? <Media close={close} /> : null}
                        </>
                    )}
                </Popover>

                <Tooltip content={t`Mention`} placement="top">
                    <AtIcon
                        className=" cursor-pointer text-main"
                        width={24}
                        height={24}
                        onClick={() => insertText('@')}
                    />
                </Tooltip>

                <Tooltip content={t`Hashtag`} placement="top">
                    <NumberSignIcon
                        className=" cursor-pointer text-main"
                        width={24}
                        height={24}
                        onClick={() => insertText('#')}
                    />
                </Tooltip>

                {process.env.NODE_ENV === 'development' ? (
                    <>
                        <Tooltip content={t`Debug Connection`} placement="top">
                            <BugAntIcon
                                className="h-[24px] w-[24px] cursor-pointer text-main"
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                    PluginDebuggerMessages?.connectionDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                        <Tooltip content={t`Debug Console`} placement="top">
                            <BugAntIcon
                                className={`h-[24px] w-[24px] cursor-pointer text-main`}
                                onClick={async () => {
                                    ComposeModalRef.close();
                                    await delay(300);
                                    PluginDebuggerMessages?.consoleDialogUpdated.sendToLocal({ open: true });
                                }}
                            />
                        </Tooltip>
                    </>
                ) : null}

                <div
                    className={classNames(
                        'flex cursor-pointer items-center gap-x-2 rounded-[32px] border border-foreground px-3 py-1',
                        {
                            'opacity-50': loading,
                        },
                    )}
                    onClick={async () => {
                        if (loading) return;
                        openRedPacketComposeDialog();
                    }}
                >
                    <RedPacketIcon width={16} height={16} />
                    <span className="text-[13px] font-medium leading-6 text-lightMain">
                        <Trans>LuckyDrop</Trans>
                    </span>
                </div>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Share to</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button
                                className=" flex cursor-pointer gap-1 text-main focus:outline-none"
                                onClick={(event) => {
                                    if (currentSource) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                    }
                                }}
                            >
                                <span className="flex items-center gap-x-1 font-bold">
                                    {postBy.map((x) => (
                                        <SourceIcon key={x} source={x} size={20} />
                                    ))}
                                </span>
                                {type === 'compose' && !currentSource && (
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </Popover.Button>
                            {!post ? <PostBy /> : null}
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Allow replies from</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <span className=" text-[15px] font-bold">
                                    {restriction === 0 ? (
                                        <Trans>Everyone</Trans>
                                    ) : (
                                        <Trans>Only people you follow</Trans>
                                    )}
                                </span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </Popover.Button>
                            <ReplyRestriction restriction={restriction} setRestriction={setRestriction} />
                        </>
                    )}
                </Popover>
            </div>
        </div>
    );
}
