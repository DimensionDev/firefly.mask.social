'use client';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/navigation';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useMemo, useRef } from 'react';
import { Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { PostActionsWithGrid } from '@/components/Actions/index.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Modal } from '@/components/Modal.js';
import { PreviewContent } from '@/components/PreviewMedia/PreviewContent.js';
import type { Source } from '@/constants/enum.js';
import { EMPTY_LIST, SUPPORTED_PREVIEW_MEDIA_TYPES } from '@/constants/index.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';

export interface PreviewMediaProps {
    index: number;
    open: boolean;
    source: Source;
    post?: Post;
    medias?: Attachment[];
    showAction?: boolean;
    onClose: () => void;
}

export function PreviewMedia({ post, source, medias, index, open, showAction = true, onClose }: PreviewMediaProps) {
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const isMedium = useIsMedium();

    const assets = useMemo(() => {
        if (medias) return medias;
        if (!post) return EMPTY_LIST;
        const asset = post.metadata.content?.asset;
        const attachments =
            post.metadata.content?.attachments?.filter((x) => SUPPORTED_PREVIEW_MEDIA_TYPES.includes(x.type)) ??
            EMPTY_LIST;

        if (asset?.type === 'Image' && attachments.length === 1) {
            return [asset];
        }
        return attachments;
    }, [post, medias]);

    return (
        <Modal open={open} backdrop={false} onClose={onClose}>
            <div
                className="preview-actions fixed inset-0 flex transform-none flex-col items-center justify-center bg-black/90 bg-opacity-90 outline-none transition-all"
                onClick={isMedium ? onClose : undefined}
            >
                <div className="absolute left-4 top-4 cursor-pointer text-main">
                    <CloseButton onClick={onClose} />
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
                        initialSlide={index}
                    >
                        {assets.map((asset, key) => {
                            return (
                                <SwiperSlide key={key} className="flex">
                                    <div className="flex h-full w-full items-center justify-center">
                                        <PreviewContent source={source} asset={asset} />
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                        <ClickableButton
                            ref={prevRef}
                            className="prev-button absolute left-[50px] top-[50%] z-50 max-md:hidden"
                        >
                            <ArrowLeftIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
                        </ClickableButton>
                        <ClickableButton
                            ref={nextRef}
                            className="next-button absolute right-[50px] top-[50%] z-50 max-md:hidden"
                        >
                            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
                        </ClickableButton>
                    </Swiper>
                </div>
                <div className="absolute my-1 flex items-center justify-between bottom-safe">
                    {post && showAction ? <PostActionsWithGrid className="gap-8" post={post} disablePadding /> : null}
                </div>
            </div>
        </Modal>
    );
}
