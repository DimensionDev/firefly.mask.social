import { DialogTitle } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { EMPTY_OBJECT } from '@masknet/shared-base';
import { Ranger, useRanger } from '@tanstack/react-ranger';
import { Fragment, useCallback, useRef, useState } from 'react';
import AvatarEditor, { type AvatarEditorProps } from 'react-avatar-editor';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { Modal, type ModalProps } from '@/components/Modal.js';

export interface ImageEditorProps extends ModalProps {
    image: string | File;
    onSave?(blob: Blob | null): void;
    AvatarEditorProps?: Omit<AvatarEditorProps, 'image'>;
}

export function ImageEditor({ image, onSave, AvatarEditorProps = EMPTY_OBJECT, ...rest }: ImageEditorProps) {
    const [editor, setEditor] = useState<AvatarEditor | null>(null);
    const [scale, setScale] = useState(1);

    const rangerRef = useRef<HTMLDivElement>(null);
    const rangerInstance = useRanger<HTMLDivElement>({
        getRangerElement: () => rangerRef.current,
        values: [scale],
        min: 1,
        max: 10,
        stepSize: 0.01,
        onChange: (instance: Ranger<HTMLDivElement>) => setScale(instance.sortedValues[0]),
        onDrag: (instance: Ranger<HTMLDivElement>) => setScale(instance.sortedValues[0]),
    });

    const handleSave = useCallback(async () => {
        if (!editor) return;
        editor.getImageScaledToCanvas().toBlob(async (blob) => {
            return onSave?.(blob);
        }, 'image/png');
    }, [editor, onSave]);

    if (!image) return null;

    return (
        <Modal {...rest} open>
            <div className="flex w-[600px] transform flex-col overflow-hidden rounded-[12px] bg-primaryBottom transition-all">
                <DialogTitle as="h3" className="relative h-14 shrink-0 pt-safe">
                    <LeftArrowIcon
                        onClick={() => rest.onClose()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                    />
                    <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                        <Trans>Edit Image</Trans>
                    </span>
                </DialogTitle>
                <div className="flex w-full flex-1 flex-col">
                    <div className="flex min-h-0 w-full flex-col gap-4 p-4">
                        <div className="mx-4">
                            <AvatarEditor
                                className="!h-auto !w-full rounded-lg"
                                {...AvatarEditorProps}
                                ref={(e) => setEditor(e)}
                                image={image}
                                scale={AvatarEditorProps.scale ?? scale}
                                rotate={AvatarEditorProps.scale ?? 0}
                                border={AvatarEditorProps.border ?? 50}
                                borderRadius={AvatarEditorProps.borderRadius ?? 300}
                            />
                        </div>
                        <div ref={rangerRef} className="relative h-1.5 w-full rounded-2xl bg-bg">
                            {rangerInstance
                                .handles()
                                .map(({ value, onKeyDownHandler, onMouseDownHandler, onTouchStart }, i) => (
                                    <Fragment key={i}>
                                        <div className="relative h-full w-full overflow-hidden rounded-2xl">
                                            <div
                                                className="h-full w-full origin-left bg-link"
                                                style={{
                                                    transform: `scaleX(${rangerInstance.getPercentageForValue(value) / 100})`,
                                                }}
                                            />
                                        </div>
                                        <button
                                            onKeyDown={onKeyDownHandler}
                                            onMouseDown={onMouseDownHandler}
                                            onTouchStart={onTouchStart}
                                            role="slider"
                                            aria-valuemin={rangerInstance.options.min}
                                            aria-valuemax={rangerInstance.options.max}
                                            aria-valuenow={value}
                                            className="willChange-[left] absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-link shadow-messageShadow"
                                            style={{
                                                left: `${rangerInstance.getPercentageForValue(value)}%`,
                                            }}
                                        />
                                    </Fragment>
                                ))}
                        </div>
                    </div>
                    <div className="mt-auto flex w-full p-4 shadow-accountCardShadowLight">
                        <ClickableButton
                            enableDefault
                            enablePropagate
                            className="flex h-10 w-full items-center justify-center rounded-lg bg-main text-medium font-bold leading-10 text-primaryBottom"
                            onClick={handleSave}
                        >
                            <Trans>Confirm</Trans>
                        </ClickableButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
