import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { Trans } from '@lingui/macro';
import { openDialog } from '@masknet/plugin-redpacket';
import { $getSelection } from 'lexical';
import { type ChangeEvent, type Dispatch, type SetStateAction, useCallback, useMemo, useRef, useState } from 'react';

import AtIcon from '@/assets/at.svg';
import GalleryIcon from '@/assets/gallery.svg';
import NumberSignIcon from '@/assets/number-sign.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import PostBy from '@/components/Compose/PostBy.js';
import ReplyRestriction from '@/components/Compose/ReplyRestriction.js';
import { SocialPlatform } from '@/constants/enum.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import uploadToIPFS from '@/services/uploadToIPFS.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';
import type { IPFS_MediaObject } from '@/types/index.js';

interface ComposeActionProps {
    type: 'compose' | 'quote' | 'reply';
    images: IPFS_MediaObject[];
    setImages: Dispatch<SetStateAction<IPFS_MediaObject[]>>;
    setLoading: (loading: boolean) => void;
    post?: Post;
}
export default function ComposeAction({ type, images, setImages, setLoading, post }: ComposeActionProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [restriction, setRestriction] = useState(0);

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

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

    const handleFileChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files) {
                setLoading(true);
                const res = await uploadToIPFS([...files]);
                setImages((_images) =>
                    [..._images]
                        .concat(
                            res.map((ipfs, index) => ({
                                file: files[index],
                                ipfs,
                            })),
                        )
                        .slice(0, currentFarcasterProfile?.profileId ? 2 : 4),
                );
                setLoading(false);
            }
        },
        [currentFarcasterProfile?.profileId, setImages, setLoading],
    );

    const postByText = useMemo(() => {
        if (!post) {
            return (
                (currentLensProfile?.profileId
                    ? `@${currentLensProfile.handle || currentLensProfile.displayName}`
                    : '') +
                (currentLensProfile?.profileId && currentFarcasterProfile?.profileId ? ', ' : '') +
                (currentFarcasterProfile?.profileId
                    ? `@${currentFarcasterProfile.handle || currentFarcasterProfile.displayName}`
                    : '')
            );
        } else {
            if (post.source === SocialPlatform.Lens) {
                return currentLensProfile?.profileId
                    ? `@${currentLensProfile.handle || currentLensProfile.displayName}`
                    : '';
            } else {
                return currentFarcasterProfile?.profileId
                    ? `@${currentFarcasterProfile.handle || currentFarcasterProfile.displayName}`
                    : '';
            }
        }
    }, [currentFarcasterProfile, currentLensProfile, post]);

    return (
        <div className=" px-4 pb-4">
            <div className=" relative flex h-9 items-center gap-3">
                <GalleryIcon
                    className=" cursor-pointer text-main"
                    width={24}
                    height={24}
                    onClick={() => {
                        if (images.length < (currentFarcasterProfile?.profileId ? 2 : 4)) {
                            fileInputRef.current?.click();
                        }
                    }}
                />
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    className=" hidden"
                    onChange={handleFileChange}
                />
                <AtIcon className=" cursor-pointer text-main" width={24} height={24} onClick={() => insertText('@')} />

                <NumberSignIcon
                    className=" cursor-pointer text-main"
                    width={24}
                    height={24}
                    onClick={() => insertText('#')}
                />

                <RedPacketIcon
                    className=" absolute left-[100px] top-[2px] cursor-pointer"
                    width={40}
                    height={40}
                    onClick={openDialog}
                />
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
                            {!post ? <PostBy images={images} /> : null}
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
