'use client';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useMemo, useRef } from 'react';
import Slider from 'react-slick';
import { useKeyPressEvent } from 'react-use';

import { PostActions } from '@/components/Actions/index.js';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';
import type { SocialSourceInURL } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface Props {
    params: {
        id: string;
        index: string;
    };
    searchParams: { source: SocialSourceInURL };
}

interface CustomArrowProps extends Omit<ClickableButtonProps, 'children'> {
    currentSlide?: number | undefined;
    slideCount?: number | undefined;
}

function CustomLeftArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowLeftIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

function CustomRightArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

export default function PreviewPhotoModal({ params: { id: postId, index }, searchParams: { source } }: Props) {
    const slickRef = useRef<{
        slickPrev: () => void;
        slickNext: () => void;
    }>(null);
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
            compact(post.metadata.content?.attachments?.filter((x) => x.type === 'Image').map((x) => x.uri)) ??
            EMPTY_LIST;

        if (asset?.type === 'Image' && imageAttachments.length === 1) {
            return [asset.uri];
        }
        return imageAttachments;
    }, [post]);

    useKeyPressEvent((ev) => ev.key === 'ArrowLeft', slickRef.current?.slickPrev);
    useKeyPressEvent((ev) => ev.key === 'ArrowRight', slickRef.current?.slickNext);

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
                    {/* Due to the react-slick type library not being updated yet,
                        we can only ignore it for now to keep things working normally.
                        https://github.com/akiran/react-slick/issues/2336
                    */}
                    {/* @ts-ignore */}
                    <Slider
                        ref={slickRef}
                        infinite={false}
                        vertical={false}
                        swapToSlide
                        initialSlide={Number(index) - 1}
                        nextArrow={<CustomRightArrow />}
                        prevArrow={<CustomLeftArrow />}
                    >
                        {images.map((x, key) => {
                            return (
                                <Image
                                    key={index}
                                    src={x}
                                    alt={x}
                                    width={1000}
                                    height={1000}
                                    style={{ width: 'auto', height: 'auto' }}
                                    className="max-h-[calc(100vh-110px)] object-contain max-md:h-[calc(calc(100vh-env(safe-area-inset-bottom)-env(safe-are-inset-top)-90px))] max-md:max-w-[calc(100%-30px)]"
                                />
                            );
                        })}
                    </Slider>
                </div>
                <div className="absolute my-1 flex items-center justify-between bottom-safe">
                    {post ? <PostActions className="gap-8" post={post} disablePadding /> : null}
                </div>
            </div>
        </Modal>
    );
}
