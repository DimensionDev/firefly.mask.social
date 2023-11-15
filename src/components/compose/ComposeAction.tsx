import PostBy from '@/components/compose/PostBy';
import ReplyRestriction from '@/components/compose/ReplyRestriction';
import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { useCallback } from 'react';

interface ComposeActionProps {
    type: 'compose' | 'quote' | 'reply';
}
export default function ComposeAction({ type }: ComposeActionProps) {
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

    return (
        <div className=" px-4 pb-4">
            <div className=" h-9 flex gap-3 items-center">
                <Image src="/svg/gallery.svg" width={24} height={24} alt="gallery" className=" cursor-pointer" />
                <Image
                    src="/svg/at.svg"
                    width={24}
                    height={24}
                    alt="at"
                    className=" cursor-pointer"
                    onClick={() => insertText('@')}
                />
                <Image
                    src="/svg/numberSign.svg"
                    width={24}
                    height={24}
                    alt="numberSign"
                    className=" cursor-pointer"
                    onClick={() => insertText('#')}
                />
                {/* <Image src="/svg/redPacket.svg" width={24} height={24} alt="redPacket" /> */}
            </div>

            <div className=" flex justify-between items-center h-9">
                <span className=" text-sm text-[#767F8D]">Post by</span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex gap-1 cursor-pointer text-[#07101B] focus:outline-none">
                                <span className=" text-sm font-bold">@LensA, @FarcasterA</span>
                                {type === 'compose' && <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />}
                            </Popover.Button>
                            <PostBy />
                        </>
                    )}
                </Popover>
            </div>

            <div className=" flex justify-between items-center h-9">
                <span className=" text-sm text-[#767F8D]">Reply Restriction</span>
                <Popover as="div" className="relative">
                    {(_) => (
                        <>
                            <Popover.Button className=" flex gap-1 cursor-pointer text-[#07101B] focus:outline-none">
                                <span className=" text-sm font-bold">Everyone can reply</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </Popover.Button>

                            <ReplyRestriction />
                        </>
                    )}
                </Popover>
            </div>
        </div>
    );
}
