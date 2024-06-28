import { Trans } from '@lingui/macro';
import { usePathname } from 'next/navigation.js';
import { memo } from 'react';
import urlcat from 'urlcat';

import LinkIcon from '@/assets/link.svg';
import Music from '@/assets/music.svg';
import Play from '@/assets/play.svg';
import { Image } from '@/components/Image.js';
import { ImageAsset } from '@/components/Posts/ImageAsset.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { ATTACHMENT } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { formatImageUrl } from '@/helpers/formatImageUrl.js';
import { getPostImageUrl } from '@/helpers/getPostImageUrl.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';

const Video = dynamic(() => import('@/components/Posts/Video.js').then((module) => module.Video), { ssr: false });
const Audio = dynamic(() => import('@/components/Posts/Audio.js').then((module) => module.Audio), { ssr: false });

const forwardTwitterVideo = (url: string) => {
    return urlcat(location.origin, '/api/twitter/videoForward', { url });
};

const getClass = (attachments: number) => {
    if (attachments === 1) {
        return {
            aspect: 'aspect-w-16 aspect-h-10',
            row: 'grid-cols-1 grid-rows-1',
        };
    } else if (attachments >= 5) {
        return {
            aspect: 'aspect-square',
            row: 'grid-cols-3',
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

interface VideoAssetProps {
    asset: Attachment;
    source: SocialSource;
    isQuote?: boolean;
}

function VideoAsset({ asset, isQuote, source }: VideoAssetProps) {
    return isQuote ? (
        <div className="relative h-full w-full">
            <div className="absolute left-[calc(50%-16px)] top-[calc(50%-16px)] flex items-center justify-center rounded-xl bg-white/80 p-2 text-[#181818]">
                <Play width={16} height={16} />
            </div>
            {asset.coverUri ? (
                <Image
                    width={120}
                    height={120}
                    className="h-[120px] w-[120px] rounded-xl object-cover"
                    src={asset.coverUri}
                    alt={asset.coverUri}
                />
            ) : null}
        </div>
    ) : (
        <Video src={source === Source.Twitter ? forwardTwitterVideo(asset.uri) : asset.uri} poster={asset.coverUri} />
    );
}

interface AttachmentsProps {
    post: Post;
    asset?: Attachment;
    attachments: Attachment[];
    isQuote?: boolean;
    isDetail?: boolean;
}

export const Attachments = memo<AttachmentsProps>(function Attachments({
    attachments,
    asset,
    post,
    isQuote = false,
    isDetail = false,
}) {
    const videoAndImageAttachments = attachments.filter((x) => x.type === 'Video' || x.type === 'Image');
    const attachmentsSnapshot = isDetail
        ? videoAndImageAttachments
        : videoAndImageAttachments.slice(0, isQuote ? 4 : 9);
    const pathname = usePathname();
    const isPostPage = isRoutePathname(pathname, '/post/:detail', true);
    const moreImageCount = videoAndImageAttachments.length - attachmentsSnapshot.length; // If it is 0 or below, there are no more images

    if (isQuote && asset?.type === 'Audio') {
        return (
            <div className="h-[120px] w-[120px]">
                {asset.coverUri ? (
                    <div className="relative">
                        <div className="absolute left-[calc(50%-16px)] top-[calc(50%-16px)] flex items-center justify-center rounded-xl bg-third p-2 text-[#181818]">
                            <Play width={16} height={16} />
                        </div>
                        <Image
                            width={120}
                            height={120}
                            src={asset.coverUri}
                            className="h-[120px] w-[120px] max-w-none"
                            alt={asset.coverUri}
                        />
                    </div>
                ) : (
                    <div className="flex h-[120px] w-[120px] flex-col items-center justify-center space-y-2 rounded-xl bg-secondaryMain px-[7.5px] py-4">
                        <span className="text-primaryBottom opacity-50">
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
    const isSoloImage = noText && attachmentsSnapshot.length === 1 && attachmentsSnapshot[0].type === 'Image';

    return (
        <div className={isQuote ? '' : 'mt-3'}>
            {attachmentsSnapshot.length === 1 ? (
                asset?.type === 'Image' ? (
                    <div
                        className={classNames({
                            'w-full': !isQuote,
                            'w-[120px]': isQuote,
                        })}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <Link
                            href={getPostImageUrl(post, 1, isPostPage)}
                            scroll={false}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                        >
                            <ImageAsset
                                className={classNames('cursor-pointer rounded-lg object-cover', {
                                    'w-full': !isQuote,
                                    'w-[120px]': isQuote,
                                    'h-[120px]': isQuote,
                                })}
                                disableLoadHandler={isQuote}
                                width={isQuote ? 120 : 1000}
                                height={isQuote ? 120 : 1000}
                                onError={({ currentTarget }) => (currentTarget.src = asset.uri)}
                                src={formatImageUrl(asset.uri, ATTACHMENT)}
                                alt={formatImageUrl(asset.uri, ATTACHMENT)}
                            />
                        </Link>
                    </div>
                ) : (
                    <div
                        className={classNames({
                            'h-[120px] w-[120px] flex-shrink-0 flex-grow-0 basis-[120px]': isQuote,
                            'w-full': !isQuote,
                        })}
                    >
                        <VideoAsset asset={asset!} isQuote={isQuote} source={post.source} />
                    </div>
                )
            ) : null}

            {attachmentsSnapshot.length > 1 ? (
                <div
                    className={classNames(
                        getClass(attachmentsSnapshot.length)?.row ?? '',
                        'grid',
                        isQuote ? 'gap-1' : 'gap-2',
                        {
                            'grid-flow-col': attachmentsSnapshot.length === 3,
                            'w-[120px]': isQuote && !isSoloImage,
                            'h-[120px]': isQuote && !isSoloImage,
                        },
                    )}
                >
                    {attachmentsSnapshot.map((attachment, index) => {
                        const uri = attachment.uri ?? '';
                        const isLast = attachmentsSnapshot.length === index + 1;
                        return (
                            <div
                                key={index}
                                className={classNames(getClass(attachmentsSnapshot.length).aspect, {
                                    'max-h-[288px]':
                                        (attachmentsSnapshot.length === 2 || attachmentsSnapshot.length === 4) &&
                                        !isQuote,
                                    'max-h-[284px]': attachmentsSnapshot.length === 3 && index === 2,
                                    'row-span-2': attachmentsSnapshot.length === 3 && index === 2,
                                    'max-h-[138px]': attachmentsSnapshot.length === 3 && index !== 2 && !isQuote,
                                    relative: isLast && moreImageCount > 0,
                                })}
                            >
                                {attachment.type === 'Image' ? (
                                    <Link
                                        href={getPostImageUrl(post, index + 1, isPostPage)}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        scroll={false}
                                    >
                                        <Image
                                            className="h-full shrink-0 cursor-pointer rounded-lg object-cover"
                                            loading="lazy"
                                            fill={isSoloImage}
                                            width={!isSoloImage ? (isQuote ? 120 : 1000) : undefined}
                                            height={!isSoloImage ? (isQuote ? 120 : 1000) : undefined}
                                            style={{
                                                maxHeight: isSoloImage && isQuote ? 288 : undefined,
                                            }}
                                            onError={({ currentTarget }) => (currentTarget.src = uri)}
                                            src={formatImageUrl(uri, ATTACHMENT)}
                                            alt={formatImageUrl(uri, ATTACHMENT)}
                                        />
                                    </Link>
                                ) : (
                                    <div className="h-full w-full">
                                        <VideoAsset asset={attachment} isQuote={isQuote} source={post.source} />
                                    </div>
                                )}
                                {isLast && moreImageCount > 0 ? (
                                    <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center rounded-lg bg-mainLight/50 text-white">
                                        <div className={classNames('font-bold', isQuote ? 'text-[15px]' : 'text-2xl')}>
                                            +{moreImageCount + 1}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {asset?.type === 'Audio' && !isQuote ? (
                <Audio src={asset.uri} poster={asset.coverUri} artist={asset.artist} title={asset.title} />
            ) : null}
            {asset?.type === 'Unknown' && !isQuote ? (
                <div className={classNames('my-2')}>
                    <div
                        className={classNames(
                            'flex items-center justify-between gap-1 rounded-lg border-primaryMain px-3 py-[6px] text-[15px]',
                            {
                                border: !isQuote,
                            },
                        )}
                    >
                        <Trans>No preview found for shared link</Trans>

                        <Link
                            href={asset.uri}
                            className="flex items-center gap-1 text-link"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <LinkIcon />
                            <Trans>View Source</Trans>
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
});
