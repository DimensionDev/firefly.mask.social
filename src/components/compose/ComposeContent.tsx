import { classNames } from '@/helpers/classNames';
import Image from 'next/image';
import Editor from '@/components/compose/Editor';
import { Dispatch, SetStateAction, useCallback } from 'react';

interface ComposeContentProps {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: string) => void;
    images: File[];
    setImages: Dispatch<SetStateAction<File[]>>;
}
export default function ComposeContent({ type, setCharacters, images, setImages }: ComposeContentProps) {
    const createImageUrl = (file: File) => URL.createObjectURL(file);

    const removeImage = useCallback(
        (index: number) => {
            setImages((_images) => {
                const newImages = [..._images];
                newImages.splice(index, 1);
                return newImages;
            });
        },
        [setImages],
    );

    const createImageItem = useCallback(
        (image: File, index: number) => (
            <>
                <Image src={createImageUrl(image)} alt={image.name} fill className=" object-cover" />
                <Image
                    src="/svg/close.svg"
                    width={18}
                    height={18}
                    alt="close"
                    className=" w-[18px] h-[18px] absolute top-2 right-2 cursor-pointer"
                    onClick={() => removeImage(index)}
                />
            </>
        ),
        [removeImage],
    );

    return (
        <div className=" p-4">
            <label
                className={classNames(
                    ' py-[14px] px-4 rounded-lg border border-[#E7E7E7] h-[338px] overflow-auto block hide-scrollbar',
                    type === 'compose' ? 'bg-[#F7F7F7]' : 'bg-white',
                )}
            >
                <div className=" min-h-full flex flex-col justify-between">
                    <Editor type={type} setCharacters={setCharacters} hasImages={images.length > 0} />

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
                        <div className=" p-3 grid grid-cols-2 gap-2 relative">
                            {images.map((image, index) => {
                                const len = images.length;

                                return (
                                    <div
                                        key={image.name + index}
                                        className={classNames(
                                            ' rounded-2xl overflow-hidden',
                                            len <= 2 ? ' h-72' : len === 3 && index === 2 ? ' h-72' : ' h-[138px]',
                                            len === 1 ? ' col-span-2' : '',
                                            len === 3 && index === 1 ? ' col-start-1' : '',
                                            len === 3 && index === 2
                                                ? ' absolute top-3 right-3 w-[251px]'
                                                : ' relative',
                                        )}
                                    >
                                        {createImageItem(image, index)}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </label>
        </div>
    );
}
