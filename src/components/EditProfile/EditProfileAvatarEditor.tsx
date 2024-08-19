import { t, Trans } from '@lingui/macro';
import { Ranger, useRanger } from '@tanstack/react-ranger';
import { useRouter } from '@tanstack/react-router';
import { Fragment, useRef, useState } from 'react';
import AvatarEditor, { type AvatarEditorProps } from 'react-avatar-editor';
import { useFormContext } from 'react-hook-form';

import { ClickableButton } from '@/components/ClickableButton.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';

export function EditProfileAvatarEditor() {
    const { history } = useRouter();
    const pfp = (history.location.state as { pfp?: FileList }).pfp;
    const file = pfp?.[0];

    const editorRef = useRef<AvatarEditorProps & { getImageScaledToCanvas: () => HTMLCanvasElement }>(null);

    const rangerRef = useRef<HTMLDivElement>(null);
    const [values, setValues] = useState<readonly number[]>([1]);
    const rangerInstance = useRanger<HTMLDivElement>({
        getRangerElement: () => rangerRef.current,
        values,
        min: 1,
        max: 10,
        stepSize: 0.01,
        onChange: (instance: Ranger<HTMLDivElement>) => setValues(instance.sortedValues),
        onDrag: (instance: Ranger<HTMLDivElement>) => setValues(instance.sortedValues),
    });

    const { setValue } = useFormContext();
    if (!file) {
        enqueueErrorMessage(t`The file is not found.`);
        history.replace('/');
    }

    const onConfirm = () => {
        editorRef.current?.getImageScaledToCanvas().toBlob((blob) => {
            if (!blob || !file) return;
            setValue('pfp', new File([blob], 'pfp.png', { type: blob.type }), { shouldDirty: true });
            history.replace('/');
        }, 'image/png');
    };

    return (
        <div className="flex w-full flex-1 flex-col">
            <div className="flex w-full flex-col space-y-5 p-4">
                {/* @ts-ignore fix react-avatar-editor type */}
                <AvatarEditor
                    className="!h-auto !w-full rounded-lg"
                    ref={editorRef}
                    image={file!}
                    width={300}
                    height={300}
                    scale={values[0]}
                />
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
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-main text-[15px] font-bold leading-10 text-primaryBottom"
                    onClick={onConfirm}
                >
                    <Trans>Confirm</Trans>
                </ClickableButton>
            </div>
        </div>
    );
}
