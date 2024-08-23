import { useRef } from 'react';

import { Button } from '@/components/Frame/Button.js';
import { Input } from '@/components/Frame/Input.js';
import { Image } from '@/components/Image.js';
import { type SocialSource } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { parseURL } from '@/helpers/parseURL.js';
import { LoginModalRef } from '@/modals/controls.js';
import { ActionType, type Frame, type FrameButton } from '@/types/frame.js';

interface CardProps {
    frame: Frame;
    source: SocialSource;
    readonly?: boolean;
    loading?: boolean;
    onButtonClick?: (button: FrameButton, input?: string) => Promise<void>;
}

export function Card({ frame, source, readonly = false, loading = false, onButtonClick }: CardProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const hostname = parseURL(frame.url)?.hostname;

    return (
        <div className="mt-4 flex flex-col">
            <div
                className="w-full rounded-xl border border-line bg-bg p-2 text-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative w-full">
                    {loading ? (
                        <div className="z10 absolute inset-0 overflow-hidden rounded-xl bg-white shadow-primary backdrop-blur-sm dark:bg-bg" />
                    ) : null}
                    <Image
                        className="divider aspect-2 w-full rounded-xl object-cover"
                        style={{
                            aspectRatio: frame.aspectRatio?.replace(':', ' / '),
                        }}
                        unoptimized
                        priority={false}
                        src={frame.image.url}
                        alt={frame.image.alt ?? frame.title}
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

                                    if (button.action === ActionType.Post) {
                                        const profile = getCurrentProfile(source);
                                        if (!profile) {
                                            LoginModalRef.open({ source });
                                            return;
                                        }
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
            {hostname ? (
                <Link
                    href={frame.url}
                    target="_blank"
                    className="ml-auto mt-1 flex justify-end text-sm text-secondary hover:underline"
                >
                    {hostname}
                </Link>
            ) : null}
        </div>
    );
}
