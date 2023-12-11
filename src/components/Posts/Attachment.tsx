import { Trans } from '@lingui/macro';
import { compact } from 'lodash-es';
import { memo, useMemo } from 'react';

import Music from '@/assets/music.svg';
import Play from '@/assets/play.svg';
import { Image } from '@/components/Image.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { ATTACHMENT } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { classNames } from '@/helpers/classNames.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { PreviewImageModalRef } from '@/modals/controls.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';
import type { MetadataAsset } from '@/types/index.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });
const Audio = dynamic(() => import('@/components/Posts/Audio.js').then((module) => module.Audio), { ssr: false });
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
    post?: Post;
    attachments: Attachment[];
    asset?: MetadataAsset;
    isQuote?: boolean;
}

export const Attachments = memo<AttachmentsProps>(function Attachments({ attachments, asset, post, isQuote = false }) {
    const { attachmentsHasImage, imageAttachments } = useMemo(() => {
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

    if (isQuote && asset?.type === 'Video') {
        return <div />;
    }

    if (isQuote && asset?.type === 'Audio') {
        return (
            <div className="h-[120px] w-[120px]">
                {asset.cover ? (
                    <div className="relative">
                        <div className="absolute left-[calc(50%-16px)] top-[calc(50%-16px)] flex items-center justify-center rounded-xl bg-third p-2 text-[#181818]">
                            <Play width={16} height={16} />
                        </div>
                        <Image src={asset.cover} className="h-[120px] w-[120px] max-w-none" alt={asset.cover} />
                    </div>
                ) : (
                    <div className="flex h-[120px] w-[120px] flex-col items-center justify-center space-y-2 rounded-xl bg-secondaryMain px-[7.5px] py-4">
                        <span className=" text-primaryBottom opacity-50">
                            <Music width={24} height={24} />
                        </span>
                        <span className="break-keep text-[11px] font-medium leading-[16px] text-secondary">
                            <Trans>Audio Cover</Trans>
                        </span>
                    </div>
                )}
            </div>
        );
    }
    const noText = !post?.metadata.content?.content;
    const isSoloImage = noText && attachmentsHasImage && imageAttachments.length === 1;

    return (
        <div className={isQuote ? '' : 'mt-3'}>
            {asset?.type === 'Image' && !attachmentsHasImage ? (
                <div className="w-full" onClick={(event) => event.stopPropagation()}>
                    <ImageAsset
                        className={classNames('cursor-pointer rounded-lg', {
                            'w-full': !isQuote,
                            'w-[120px]': isQuote,
                            'h-[120px]': isQuote,
                        })}
                        loading="lazy"
                        width={isQuote ? 120 : 1000}
                        height={isQuote ? 120 : 1000}
                        onError={({ currentTarget }) => (currentTarget.src = asset.uri)}
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            PreviewImageModalRef.open({
                                images: [asset.uri],
                                current: asset.uri,
                                post,
                            });
                        }}
                        src={formatImageUrl(asset.uri, ATTACHMENT)}
                        alt={formatImageUrl(asset.uri, ATTACHMENT)}
                    />
                </div>
            ) : null}
            {attachmentsHasImage ? (
                <div
                    className={classNames(getClass(imageAttachments.length)?.row ?? '', 'grid gap-2', {
                        'grid-flow-col': imageAttachments.length === 3,
                        'w-[120px]': isQuote && !isSoloImage,
                        'h-[120px]': isQuote && !isSoloImage,
                    })}
                >
                    {imageAttachments.map((attachment, index) => {
                        const uri = attachment.uri ?? '';
                        return (
                            <div
                                key={index}
                                className={classNames(getClass(imageAttachments.length).aspect, {
                                    'row-span-2': imageAttachments.length === 3 && index === 2,
                                    'max-h-[138px]': imageAttachments.length === 3 && index !== 2 && !isQuote,
                                })}
                            >
                                <Image
                                    className="h-full cursor-pointer rounded-lg object-cover"
                                    loading="lazy"
                                    width={1000}
                                    height={1000}
                                    style={{
                                        maxHeight: isSoloImage && isQuote ? 288 : undefined,
                                    }}
                                    onError={({ currentTarget }) => (currentTarget.src = uri)}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        PreviewImageModalRef.open({
                                            images: compact(imageAttachments.map((x) => x.uri)),
                                            current: uri,
                                            post,
                                        });
                                    }}
                                    src={formatImageUrl(uri, ATTACHMENT)}
                                    alt={formatImageUrl(uri, ATTACHMENT)}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {asset?.type === 'Video' && !isQuote ? <Video src={asset.uri} poster={asset.cover} /> : null}
            {asset?.type === 'Audio' && !isQuote ? (
                <Audio src={asset.uri} poster={asset.cover} artist={asset.artist} title={asset.title} />
            ) : null}
        </div>
    );
});
