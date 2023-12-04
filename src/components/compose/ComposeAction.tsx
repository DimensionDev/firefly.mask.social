import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { Trans } from '@lingui/macro';
import { $getSelection } from 'lexical';
import { type ChangeEvent, type Dispatch, type SetStateAction, useCallback, useRef, useState } from 'react';

import AtIcon from '@/assets/at.svg';
import GalleryIcon from '@/assets/gallery.svg';
import NumberSignIcon from '@/assets/numberSign.svg';
import type { IImage } from '@/components/Compose/index.js';
import PostBy from '@/components/Compose/PostBy.js';
import ReplyRestriction from '@/components/Compose/ReplyRestriction.js';
import uploadToIPFS from '@/services/uploadToIPFS.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

interface ComposeActionProps {
    type: 'compose' | 'quote' | 'reply';
    images: IImage[];
    setImages: Dispatch<SetStateAction<IImage[]>>;
    setLoading: (loading: boolean) => void;
}
export default function ComposeAction({ type, images, setImages, setLoading }: ComposeActionProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [restriction, setRestriction] = useState(0);

    const currentLensAccount = useLensStateStore.use.currentAccount();
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount();

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
                        .slice(0, currentFarcasterAccount.id ? 2 : 4),
                );
                setLoading(false);
            }
        },
        [currentFarcasterAccount.id, setImages, setLoading],
    );

    return (
        <div className=" px-4 pb-4">
            <div className=" flex h-9 items-center gap-3">
                <GalleryIcon
                    className=" cursor-pointer"
                    width={24}
                    height={24}
                    onClick={() => {
                        if (images.length < (currentFarcasterAccount.id ? 2 : 4)) {
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
                <AtIcon className=" cursor-pointer" width={24} height={24} onClick={() => insertText('@')} />

                <NumberSignIcon className=" cursor-pointer" width={24} height={24} onClick={() => insertText('#')} />
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-sm text-secondary">
                    <Trans>Post by</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <span className=" text-sm font-bold">
                                    {currentLensAccount.id
                                        ? `@${currentLensAccount.handle || currentLensAccount.id}`
                                        : ''}
                                    {currentLensAccount.id && currentFarcasterAccount.id ? ', ' : ''}
                                    {currentFarcasterAccount.id ? `@${currentFarcasterAccount.id}` : ''}
                                </span>
                                {type === 'compose' && <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />}
                            </Popover.Button>
                            <PostBy images={images} />
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex h-9 items-center justify-between">
                <span className=" text-sm text-secondary">
                    <Trans>Reply Restriction</Trans>
                </span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex cursor-pointer gap-1 text-main focus:outline-none">
                                <span className=" text-sm font-bold">
                                    <Trans>
                                        {restriction === 0 ? 'Everyone can reply' : 'Only people you follow can reply'}
                                    </Trans>
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
