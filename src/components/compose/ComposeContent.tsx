import { classNames } from '@/helpers/classNames';
import Image from 'next/image';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext';
import Editor from '@/components/compose/Editor';

interface ComposeContentProps {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: number) => void;
}
function ComposeContent({ type, setCharacters }: ComposeContentProps) {
    const images: Array<{
        name: string;
        src: string;
    }> = [
        // {
        //     name: 'gallery',
        //     src: '/svg/gallery.svg',
        // },
        // {
        //     name: 'gallery1',
        //     src: '/svg/at.svg',
        // },
        // {
        //     name: 'gallery2',
        //     src: '/svg/numberSign.svg',
        // },
        // {
        //     name: 'gallery3',
        //     src: '/svg/gallery.svg',
        // },
    ];

    return (
        <div className=" p-4">
            <label
                className={classNames(
                    ' py-[14px] px-4 rounded-lg border border-[#E7E7E7] h-[338px] overflow-auto block',
                    type === 'compose' ? 'bg-[#F7F7F7]' : 'bg-white',
                )}
            >
                <div className=" overflow-auto min-h-full flex flex-col justify-between">
                    <Editor type={type} />

                    {/* quote */}
                    {(type === 'quote' || type === 'reply') && (
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
                                <p className=" text-left">123</p>
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

                    {/* image */}
                    {images.length > 0 && (
                        <div className={classNames(' p-3 grid grid-cols-2 gap-2')}>
                            {images.map((image, index) => {
                                const len = images.length;

                                if (len === 1) {
                                    return (
                                        <div
                                            key={image.name}
                                            className=" col-span-2 relative h-72 rounded-2xl overflow-hidden"
                                        >
                                            <Image src={image.src} alt={image.name} fill className=" object-cover" />
                                            <Image
                                                src="/svg/close.svg"
                                                width={18}
                                                height={18}
                                                alt="close"
                                                className=" absolute top-2 right-2 cursor-pointer"
                                            />
                                        </div>
                                    );
                                }

                                if (len === 2) {
                                    return (
                                        <div key={image.name} className=" relative h-72 rounded-2xl overflow-hidden">
                                            <Image src={image.src} alt={image.name} fill className=" object-cover" />
                                            <Image
                                                src="/svg/close.svg"
                                                width={18}
                                                height={18}
                                                alt="close"
                                                className=" absolute top-2 right-2 cursor-pointer"
                                            />
                                        </div>
                                    );
                                }

                                if (len === 3) {
                                    return (
                                        <div
                                            key={image.name}
                                            className={classNames(' relative h-[138px] rounded-2xl overflow-hidden')}
                                        >
                                            <Image src={image.src} alt={image.name} fill className=" object-cover" />
                                            <Image
                                                src="/svg/close.svg"
                                                width={18}
                                                height={18}
                                                alt="close"
                                                className=" absolute top-2 right-2 cursor-pointer"
                                            />
                                        </div>
                                    );
                                }

                                if (len === 4) {
                                    return (
                                        <div
                                            key={image.name}
                                            className={classNames(' relative h-[138px] rounded-2xl overflow-hidden')}
                                        >
                                            <Image src={image.src} alt={image.name} fill className=" object-cover" />
                                            <Image
                                                src="/svg/close.svg"
                                                width={18}
                                                height={18}
                                                alt="close"
                                                className=" absolute top-2 right-2 cursor-pointer"
                                            />
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}

export default withLexicalContext(ComposeContent);
