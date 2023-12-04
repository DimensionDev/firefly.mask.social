import { type Dispatch, type SetStateAction, useCallback } from 'react';

import CloseIcon from '@/assets/close.svg';
import Editor from '@/components/Compose/Editor.js';
import type { IImage } from '@/components/Compose/index.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { TimestampFormatter } from '@/components/TimeStampFormatter.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface ComposeContentProps {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: string) => void;
    images: File[];
    setImages: Dispatch<SetStateAction<IImage[]>>;
    post?: Post;
}
export default function ComposeContent({ type, setCharacters, images, setImages, post }: ComposeContentProps) {
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
                <CloseIcon
                    className=" absolute right-2 top-2 h-[18px] w-[18px] cursor-pointer"
                    width={18}
                    height={18}
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
                    ' hide-scrollbar border-line2 block h-[338px] overflow-auto rounded-lg border bg-bg px-4 py-[14px]',
                )}
            >
                <div className=" flex min-h-full flex-col justify-between">
                    <Editor type={type} setCharacters={setCharacters} hasImages={images.length > 0} hasPost={!!post} />

                    {/* quote */}
                    {(type === 'quote' || type === 'reply') && post ? (
                        <div className=" flex flex-col gap-1 rounded-2xl border border-[#acb4c1] bg-bg p-3">
                            <div className=" flex h-6 items-center justify-between">
                                <div className=" flex items-center gap-2">
                                    <Image src={post.author.pfp} width={24} height={24} alt="pfp" />
                                    <span className=" text-sm font-medium text-main">{post.author.displayName}</span>
                                    <span className=" text-sm text-secondary">
                                        @{post.author.handle || post.author.profileId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SourceIcon source={post.source} />
                                    <span className="text-xs leading-4 text-secondary">
                                        <TimestampFormatter time={post.timestamp} />
                                    </span>
                                </div>
                            </div>

                            <div className=" flex gap-4">
                                <p className=" text-left">{post.metadata.content?.content}</p>
                                {(post.mediaObjects?.length ?? 0) > 0 && (
                                    <Image
                                        src={post.mediaObjects?.[0].url ?? ''}
                                        width={120}
                                        height={120}
                                        alt={post.postId}
                                        className=" h-[120px] w-[120px] rounded-lg object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* image */}
                    {images.length > 0 && (
                        <div className=" relative grid grid-cols-2 gap-2 p-3">
                            {images.map((image, index) => {
                                const len = images.length;

                                return (
                                    <div
                                        key={image.name + index}
                                        className={classNames(
                                            ' overflow-hidden rounded-2xl',
                                            len <= 2 ? ' h-72' : len === 3 && index === 2 ? ' h-72' : ' h-[138px]',
                                            len === 1 ? ' col-span-2' : '',
                                            len === 3 && index === 1 ? ' col-start-1' : '',
                                            len === 3 && index === 2
                                                ? ' absolute right-3 top-3 w-[251px]'
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
