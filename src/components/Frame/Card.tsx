import { useRef } from 'react';

import { Button } from '@/components/Frame/Button.js';
import { Input } from '@/components/Frame/Input.js';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { LoginModalRef } from '@/modals/controls.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { ActionType, type Frame, type FrameButton } from '@/types/frame.js';

interface CardProps {
    frame: Frame;
    readonly?: boolean;
    loading?: boolean;
    onButtonClick?: (button: FrameButton, input?: string) => Promise<void>;
}

export function Card({ frame, readonly = false, loading = false, onButtonClick }: CardProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className="mt-4 w-full rounded-xl border border-line bg-bg p-2 text-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative w-full">
                {loading ? (
                    <div
                        className="z10 absolute inset-0 overflow-hidden rounded-xl bg-white dark:bg-bg"
                        style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(4px)' }}
                    />
                ) : null}
                <Image
                    className="divider aspect-2 w-full rounded-xl object-cover"
                    style={{
                        aspectRatio: frame.aspectRatio?.replace(':', ' / '),
                    }}
                    unoptimized
                    priority={false}
                    src={frame.image.url}
                    alt={frame.title}
                    width={frame.image.width}
                    height={frame.image.height}
                />
            </div>
            {frame.input ? (
                <div className="mt-2 flex">
                    <Input input={frame.input} ref={inputRef} />
                </div>
            ) : null}
            {frame.buttons.length ? (
                <div className="mt-2 flex gap-2">
                    {frame.buttons.map((button) => (
                        <Button
                            key={button.index}
                            button={button}
                            disabled={loading || readonly}
                            onClick={async () => {
                                if (readonly || loading) return;

                                if (!farcasterSessionHolder.session && button.action === ActionType.Post) {
                                    LoginModalRef.open({
                                        source: Source.Farcaster,
                                    });
                                    return;
                                }

                                const inputText = inputRef.current?.value;
                                // there is only one input field in the frame
                                // when a new frame arrives, clear the input field
                                if (inputRef.current) inputRef.current.value = '';

                                await onButtonClick?.(button, inputText);
                            }}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
