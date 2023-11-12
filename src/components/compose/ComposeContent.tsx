import { classNames } from '@/helpers/classNames';
import Image from 'next/image';
import { useMemo } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface ComposeContentProps {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: number) => void;
}
export default function ComposeContent({ type, setCharacters }: ComposeContentProps) {
    const placeholder = useMemo(() => {
        return {
            compose: "What's happening...",
            quote: 'Add a comment',
            reply: 'Post your reply',
        }[type];
    }, [type]);

    const minRows = useMemo(() => {
        return {
            compose: 13,
            quote: 4,
            reply: 4,
        }[type];
    }, [type]);

    const images = [
        {
            name: 'gallery',
            src: '/svg/gallery.svg',
        },
        {
            name: 'gallery1',
            src: '/svg/gallery.svg',
        },
        {
            name: 'gallery2',
            src: '/svg/gallery.svg',
        },
        {
            name: 'gallery3',
            src: '/svg/gallery.svg',
        },
    ];

    return (
        <div className=" p-4">
            <label
                className={classNames(
                    ' p-[14px] rounded-lg border border-[#E7E7E7] h-[338px] overflow-auto block',
                    type === 'compose' ? 'bg-[#F7F7F7]' : 'bg-white',
                )}
            >
                <div className=" overflow-auto min-h-full flex flex-col justify-between">
                    <TextareaAutosize
                        className=" bg-transparent text-base w-full resize-none border-none outline-0 appearance-none p-0 focus:ring-0"
                        placeholder={placeholder}
                        onChange={(e) => setCharacters(e.target.value.length)}
                    />

                    {(type === 'quote' || type === 'compose') && (
                        <div className=" bg-[#F9F9F9] rounded-2xl border border-[#ACB4C1] p-3 gap-1">
                            <div className=" h-6 flex items-center justify-between">
                                <div className=" flex items-center gap-2">
                                    <Image src="/svg/gallery.svg" width={24} height={24} alt="gallery" />
                                    <span className=" text-sm text-[#07101B] font-medium">Judd</span>
                                    <span className=" text-sm text-[#767F8D]">@judd</span>
                                </div>
                                <div className=" flex items-center gap-2">
                                    <Image src="/svg/gallery.svg" width={16} height={16} alt="gallery" />
                                    <span className=" text-xs text-[#767F8D] font-medium">1h</span>
                                </div>
                            </div>

                            <div className=" flex gap-4">
                                <p className=" text-left">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra @dictum donec eu,
                                    interdum tellus elementum, adipiscing. Lorem ipsum dolor sit amet. Tortor elementum
                                    sagittis tempus tempor cras lobortis.
                                </p>
                                <Image
                                    src="/svg/gallery.svg"
                                    width={120}
                                    height={120}
                                    alt="gallery"
                                    className=" object-cover w-[120px] h-[120px] rounded-lg"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}
