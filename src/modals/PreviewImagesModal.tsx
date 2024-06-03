import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { EMPTY_LIST } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { forwardRef, useEffect, useState } from 'react';
import { useKeyPressEvent, useStateList } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { Image } from '@/components/Image.js';
import { Modal } from '@/components/Modal.js';

export interface PreviewImagesModalOpenProps {
    images: string[];
    current: string;
}

export const PreviewImagesModal = forwardRef<SingletonModalRefCreator<PreviewImagesModalOpenProps>>(
    function PreviewImagesModal(_, ref) {
        const [current, setCurrent] = useState<string>();
        const [images, setImages] = useState<string[]>([]);

        const { state, setState, prev, next, currentIndex } = useStateList(images);
        const isMultiple = images.length > 1;
        const isAtStart = currentIndex === 0;
        const isAtEnd = currentIndex === images.length - 1;
        const currentIsIncluded = current && images.includes(current);

        useEffect(() => {
            if (currentIsIncluded) setState(current);
        }, [currentIsIncluded, setState, current]);

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

        useKeyPressEvent((ev) => ev.key === 'ArrowLeft', prev);
        useKeyPressEvent((ev) => ev.key === 'ArrowRight', next);

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

                            {isMultiple && !isAtStart ? (
                                <ClickableButton
                                    className="absolute left-4 cursor-pointer rounded-full p-1 text-main hover:bg-bg"
                                    onClick={prev}
                                >
                                    <ArrowLeftIcon width={24} height={24} />
                                </ClickableButton>
                            ) : null}

                            {isMultiple && !isAtEnd ? (
                                <ClickableButton
                                    className="absolute right-4 cursor-pointer rounded-full p-1 text-main hover:bg-bg"
                                    onClick={next}
                                >
                                    <ArrowRightIcon width={24} height={24} />
                                </ClickableButton>
                            ) : null}

                            <Image
                                src={state ?? current}
                                alt={state ?? current}
                                width={1000}
                                height={1000}
                                style={{ width: 'auto', height: 'auto' }}
                                className="max-h-[calc(100vh-110px)] max-w-full"
                            />
                        </>
                    ) : null}
                </div>
            </Modal>
        );
    },
);
