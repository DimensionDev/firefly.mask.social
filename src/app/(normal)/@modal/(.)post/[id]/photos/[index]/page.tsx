'use client';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/navigation';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useMemo, useRef } from 'react';
import { Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PostActionsWithGrid } from '@/components/Actions/index.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import { VideoAsset } from '@/components/Posts/Attachment.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';

interface Props {
    params: {
        id: string;
        index: string;
    };
    searchParams: { source: SocialSourceInURL };
}

interface PreviewContentProps {
    post: Post;
    asset: Attachment;
}

const PreviewContent = memo<PreviewContentProps>(function PreviewContent({ post, asset }) {
    return asset.type === 'Image' ? (
        <Image
            key={asset.uri}
            src={asset.uri}
            alt={asset.title ?? asset.uri}
            width={1000}
            height={1000}
            className="max-h-[calc(100vh-110px)] w-full object-contain max-md:h-[calc(calc(100vh-env(safe-area-inset-bottom)-env(safe-are-inset-top)-90px))] max-md:max-w-[calc(100%-30px)]"
        />
    ) : asset.type === 'AnimatedGif' ? (
        <VideoAsset post={post} asset={asset} source={post.source} canPreview={false} />
    ) : null;
});

export default function PreviewPhotoModal({ params: { id: postId, index }, searchParams: { source } }: Props) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const isMedium = useIsMedium();

    const currentSource = resolveSocialSource(source);

    const { data: post = null } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            const provider = resolveSocialMediaProvider(currentSource);
            const post = await provider.getPostById(postId);
            if (!post) return;

            return post;
        },
        // The image data of the post will not be changed.
        staleTime: Infinity,
    });

    const images = useMemo(() => {
        if (!post) return EMPTY_LIST;
        const asset = post.metadata.content?.asset;
        const imageAttachments =
            compact(post.metadata.content?.attachments?.filter((x) => ['Image', 'AnimatedGif'].includes(x.type))) ??
            EMPTY_LIST;

        if (asset?.type === 'Image' && imageAttachments.length === 1) {
            return [{ ...asset }];
        }
        return imageAttachments;
    }, [post]);

    return (
        <Modal open backdrop={false} onClose={() => router.back()}>
            <div
                className="preview-actions fixed inset-0 flex transform-none flex-col items-center justify-center bg-black/90 bg-opacity-90 outline-none transition-all"
                onClick={isMedium ? () => router.back() : undefined}
            >
                <div className="absolute left-4 top-4 cursor-pointer text-main">
                    <CloseButton onClick={() => router.back()} />
                </div>
                <div className="flex w-full text-main">
                    <Swiper
                        modules={[Navigation, Keyboard]}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper) => {
                            if (typeof swiper.params.navigation === 'object') {
                                swiper.params.navigation.prevEl = prevRef.current;
                                swiper.params.navigation.nextEl = nextRef.current;
                            }
                        }}
                        keyboard
                        initialSlide={Number(index) - 1}
                    >
                        {images.map((asset, key) => {
                            return (
                                <SwiperSlide key={key} className="flex">
                                    <div className="flex h-full w-full items-center justify-center">
                                        <PreviewContent post={post!} asset={asset} />
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                        <ClickableButton
                            ref={prevRef}
                            className="prev-button absolute left-[50px] top-[50%] z-[9999] max-md:hidden"
                        >
                            <ArrowLeftIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
                        </ClickableButton>
                        <ClickableButton
                            ref={nextRef}
                            className="next-button absolute right-[50px] top-[50%] z-[9999] max-md:hidden"
                        >
                            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
                        </ClickableButton>
                    </Swiper>
                </div>
                <div className="absolute my-1 flex items-center justify-between bottom-safe">
                    {post ? <PostActionsWithGrid className="gap-8" post={post} disablePadding /> : null}
                </div>
            </div>
        </Modal>
    );
}
