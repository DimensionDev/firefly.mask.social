import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { t, Trans } from '@lingui/macro';
import { openDialog } from '@masknet/plugin-redpacket';
import { $getSelection } from 'lexical';
import { useCallback, useMemo, useState } from 'react';

import AtIcon from '@/assets/at.svg';
import GalleryIcon from '@/assets/gallery.svg';
import NumberSignIcon from '@/assets/number-sign.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import Media from '@/components/Compose/Media.js';
import PostBy from '@/components/Compose/PostBy.js';
import ReplyRestriction from '@/components/Compose/ReplyRestriction.js';
import { Tooltip } from '@/components/Tooltip.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface ComposeActionProps {}
export default function ComposeAction(props: ComposeActionProps) {
    const [restriction, setRestriction] = useState(0);

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const type = useComposeStateStore.use.type();
    const post = useComposeStateStore.use.post();

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

    const postByText = useMemo(() => {
        const lensHandle = currentLensProfile?.handle;
        const farcasterHandle = currentFarcasterProfile?.handle;
        if (!post) {
            return `@${lensHandle}` + (lensHandle && farcasterHandle ? ', ' : '') + `@${farcasterHandle}`;
        } else {
            if (post.source === SocialPlatform.Lens) {
                return `@${lensHandle}`;
            } else {
                return `@${farcasterHandle}`;
            }
        }
    }, [currentFarcasterProfile, currentLensProfile, post]);

    return (
        <div className=" px-4 pb-4">
            <div className=" relative flex h-9 items-center gap-3">
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <Tooltip content={t`Media`} placement="top">
                                    <GalleryIcon className=" cursor-pointer text-main" width={24} height={24} />
                                </Tooltip>
                            </Popover.Button>

                            <Media />
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

                <Tooltip content={t`Red Packet`} placement="top">
                    <RedPacketIcon className=" cursor-pointer" width={25} height={25} onClick={openDialog} />
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
