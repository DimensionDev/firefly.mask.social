import type { Attachment } from '@/providers/types/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';
import { Image } from '@/components/Image.js';
import { memo, useMemo, useState } from 'react';
import { ATTACHMENT } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { dynamic } from '@/esm/dynamic.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });

const getClass = (attachments: number) => {
    if (attachments === 1) {
        return {
            aspect: 'aspect-w-16 aspect-h-10',
            row: 'grid-cols-1 grid-rows-1',
        };
    } else if (attachments === 2) {
        return {
            aspect: 'aspect-w-16 aspect-h-12',
            row: 'grid-cols-2 grid-rows-1',
        };
    } else if (attachments > 2) {
        return {
            aspect: 'aspect-w-16 aspect-h-12',
            row: 'grid-cols-2 grid-rows-2',
        };
    }
    return {
        aspect: '',
        row: '',
    };
};

interface AttachmentsProps {
    attachments: Attachment[];
    asset?: MetadataAsset;
}

export const Attachments = memo<AttachmentsProps>(function Attachments({ attachments, asset }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { processedAttachments, attachmentsHasImage, imageAttachments } = useMemo(() => {
        // TODO: farcaster only support 2 attachment
        const processedAttachments = attachments.slice(0, 4);
        const attachmentsHasImage = attachments.some((x) => x.type === 'Image');
        const imageAttachments = processedAttachments.filter((x) => x.type === 'Image' && x.uri);

        return {
            processedAttachments,
            attachmentsHasImage,
            imageAttachments,
        };
    }, [attachments]);

    return (
        <div className="mt-3">
            {asset?.type === 'Image' && !attachmentsHasImage ? (
                <div className="w-full" onClick={(event) => event.stopPropagation}>
                    <ImageAsset
                        className="w-full cursor-pointer rounded-lg"
                        loading="lazy"
                        width={1000}
                        height={1000}
                        onError={({ currentTarget }) => (currentTarget.src = asset.uri)}
                        onClick={() => setPreviewImage(asset.uri)}
                        src={formatImageUrl(asset.uri, ATTACHMENT)}
                        alt={formatImageUrl(asset.uri, ATTACHMENT)}
                    />
                </div>
            ) : null}
            {attachmentsHasImage ? (
                <div
                    className={classNames(getClass(imageAttachments.length)?.row ?? '', 'grid gap-2', {
                        'grid-auto-flow': imageAttachments.length === 3,
                    })}
                >
                    {imageAttachments.map((attachment, index) => {
                        const uri = attachment.uri ?? '';
                        return (
                            <div
                                key={index}
                                className={classNames(getClass(imageAttachments.length).aspect, {
                                    'row-span-2': imageAttachments.length === 3 && index === 2,
                                    'max-h-[138px]': imageAttachments.length === 3 && index !== 2,
                                })}
                            >
                                <Image
                                    className={classNames('h-full cursor-pointer rounded-lg object-cover')}
                                    loading="lazy"
                                    width={1000}
                                    height={1000}
                                    onError={({ currentTarget }) => (currentTarget.src = uri)}
                                    onClick={() => setPreviewImage(uri)}
                                    src={formatImageUrl(uri, ATTACHMENT)}
                                    alt={formatImageUrl(uri, ATTACHMENT)}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {asset?.type === 'Video' ? <Video src={asset.uri} poster={asset.cover} /> : null}
        </div>
    );
});
