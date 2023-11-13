import PostBy from '@/components/compose/PostBy';
import ReplyRestriction from '@/components/compose/ReplyRestriction';
import { Popover } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

interface ComposeActionProps {
    type: 'compose' | 'quote' | 'reply';
}
export default function ComposeAction({ type }: ComposeActionProps) {
    return (
        <div className=" px-4 pb-4">
            <div className=" h-9 flex gap-3 items-center">
                <Image src="/svg/gallery.svg" width={24} height={24} alt="gallery" />
                <Image src="/svg/at.svg" width={24} height={24} alt="at" />
                <Image src="/svg/numberSign.svg" width={24} height={24} alt="numberSign" />
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
