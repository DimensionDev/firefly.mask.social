import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/keyboard';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, useState } from 'react';
import { Keyboard, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';

interface CustomArrowProps extends Omit<ClickableButtonProps, 'children'> {
    currentSlide?: number | undefined;
    slideCount?: number | undefined;
}

export function CustomLeftArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowLeftIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

export function CustomRightArrow(props: CustomArrowProps) {
    return (
        <ClickableButton {...props}>
            <ArrowRightIcon width={24} height={24} className="rounded-full p-1 text-main hover:bg-bg" />
        </ClickableButton>
    );
}

export interface PreviewImagesModalOpenProps {
    images: string[];
    current: string;
}

export const PreviewImagesModal = forwardRef<SingletonModalRefCreator<PreviewImagesModalOpenProps>>(
    function PreviewImagesModal(_, ref) {
        const [current, setCurrent] = useState<string>();
        const [images, setImages] = useState<string[]>([]);

        const index = current ? images.findIndex((x) => x === current) : undefined;

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setImages(props.images);
                setCurrent(props.current);
            },
            onClose: () => {
                setCurrent(undefined);
                setImages(EMPTY_LIST);
            },
        });

        return (
            <Modal open={open} backdrop={false} onClose={() => dispatch?.close()}>
                <div
                    className="preview-actions fixed inset-0 flex transform-none flex-col items-center justify-center bg-black/90 bg-opacity-90 transition-all"
                    onClick={() => dispatch?.close()}
                >
                    {open ? (
                        <>
                            <div className="absolute left-4 top-4 cursor-pointer text-main">
                                <CloseButton onClick={() => dispatch?.close()} />
                            </div>

                            <div className="flex w-full text-main">
                                <Swiper
                                    modules={[Navigation, Keyboard]}
                                    navigation={{
                                        prevEl: '.prev-button',
                                        nextEl: '.next-button',
                                    }}
                                    keyboard
                                    initialSlide={index && index > 0 ? index : undefined}
                                >
                                    {images.map((x, key) => {
                                        return (
                                            <SwiperSlide key={key} className="flex">
                                                <div className="max-md:flex max-md:justify-center">
                                                    <Image
                                                        key={index}
                                                        src={x}
                                                        alt={x}
                                                        width={1000}
                                                        height={1000}
                                                        className="max-h-[calc(100vh-110px)] w-full object-contain max-md:h-[calc(calc(100vh-env(safe-area-inset-bottom)-env(safe-are-inset-top)-90px))] max-md:max-w-[calc(100%-30px)]"
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                    <CustomLeftArrow className="prev-button absolute left-[50px] top-[50%] z-[9999] max-md:hidden" />
                                    <CustomRightArrow className="next-button absolute right-[50px] top-[50%] z-[9999] max-md:hidden" />
                                </Swiper>
                            </div>
                        </>
                    ) : null}
                </div>
            </Modal>
        );
    },
);
