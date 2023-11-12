import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

export default function ComposeAction() {
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
                <div className=" flex gap-1 cursor-pointer text-[#07101B]">
                    <span className=" text-sm font-bold">@LensA, @FarcasterA</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </div>
            </div>

            <div className=" flex justify-between items-center h-9">
                <span className=" text-sm text-[#767F8D]">Reply Restriction</span>
                <div className=" flex gap-1 cursor-pointer text-[#07101B]">
                    <span className=" text-sm font-bold">Everyone can reply</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </div>
            </div>
        </div>
    );
}
