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
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { connectMaskWithWagmi } from '@/helpers/connectWagmiWithMask.js';
import { PluginDebuggerMessages } from '@/mask/message-host/index.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface ComposeActionProps {}
export default function ComposeAction(props: ComposeActionProps) {
    const [restriction, setRestriction] = useState(0);

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const { type, post, images, video, availableSources } = useComposeStateStore();

    const [editor] = useLexicalComposerContext();

    const insertText = useCallback(
        (text: string) => {
            editor.update(() => {
                const selection = $getSelection();
                if (selection) {
                    selection.insertText(text);
                }
            });
        },
        [editor],
    );

    const lensHandle = currentLensProfile?.handle;
    const farcasterHandle = currentFarcasterProfile?.handle;
    const postByText = useMemo(() => {
        if (!post) {
            return compact([
                availableSources.includes(SocialPlatform.Lens) ? lensHandle : null,
                availableSources.includes(SocialPlatform.Farcaster) ? farcasterHandle : null,
            ])
                .map((x) => `@${x}`)
                .join(', ');
        } else {
            switch (post.source) {
                case SocialPlatform.Lens:
                    return `@${lensHandle}`;
                case SocialPlatform.Farcaster:
                    return `@${farcasterHandle}`;
                default:
                    safeUnreachable(post.source);
                    return '';
            }
        }
    }, [lensHandle, farcasterHandle, availableSources, post]);

    const [{ loading }, openRedPacketComposeDialog] = useAsyncFn(async () => {
        await connectMaskWithWagmi();
        // import dynamically to avoid the start up dependency issue of mask packages
        await import('@/helpers/setupCurrentVisitingProfile.js').then((module) =>
            module.setupCurrentVisitingProfileAsFireflyApp(),
        );
        ComposeModalRef.close();
        await delay(300);
        CrossIsolationMessages.events.redpacketDialogEvent.sendToLocal({ open: true });
    }, []);

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

                <Tooltip content={t`Lucky Drop`} placement="top">
                    <RedPacketIcon
                        className={classNames('cursor-pointer', {
                            'opacity-50': loading,
                        })}
                        width={25}
                        height={25}
                        onClick={() => {
                            if (loading) return;
                            openRedPacketComposeDialog();
                        }}
                    />
                </Tooltip>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Post by</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <span className=" text-[15px] font-bold">{postByText}</span>
                                {type === 'compose' && <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />}
                            </Popover.Button>
                            {!post ? <PostBy /> : null}
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-[15px] text-secondary">
                    <Trans>Reply Restriction</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <span className=" text-[15px] font-bold">
                                    {restriction === 0 ? (
                                        <Trans>Everyone can reply</Trans>
                                    ) : (
                                        <Trans>Only people you follow can reply</Trans>
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
