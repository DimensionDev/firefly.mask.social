import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import LinkIcon from '@/assets/link.svg';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { ActionType, type Frame, type FrameButton, type LinkDigested } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

interface FrameProps {
    postId: string;
    url: string;
    onData?: (frame: Frame) => void;
    children?: React.ReactNode;
}

export function Frame({ postId, url, onData, children }: FrameProps) {
    const enqueueSnackbar = useCustomSnackbar();

    const inputRef = useRef<HTMLInputElement>(null);
    const [latestFrame, setLatestFrame] = useState<Frame | null>(null);

    const { isLoading, error, data } = useQuery({
        queryKey: ['frame', url],
        queryFn: () => {
            if (!url) return;
            return fetchJSON<ResponseJSON<LinkDigested>>(
                urlcat('/api/frame', {
                    link: url,
                }),
            );
        },
        enabled: !!url,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (!data?.success || !data?.data?.frame) return;
        onData?.(data.data.frame);
    }, [data, onData]);

    const [{ loading }, handleClick] = useAsyncFn(
        async (button: FrameButton, input?: string) => {
            try {
                const frame = data?.success ? data.data.frame : null;
                if (!frame) return;

                const url = urlcat('/api/frame', {
                    url: frame.url,
                    action: button.action,
                    'post-url': frame.postUrl,
                });

                const packet = await HubbleSocialMediaProvider.generateFrameSignaturePacket(
                    postId,
                    frame,
                    button.index,
                    input,
                );
                const response = await fetchJSON<ResponseJSON<LinkDigested>>(url, {
                    method: 'POST',
                    body: JSON.stringify(packet),
                });

                const nextFrame = response.success ? response.data.frame : null;
                if (!nextFrame)
                    return enqueueSnackbar(t`There is something wrong with the frame. Please try again.`, {
                        variant: 'error',
                    });

                setLatestFrame(nextFrame);
            } catch (error) {
                enqueueSnackbar(
                    error instanceof Error
                        ? error.message
                        : t`There is something wrong with the frame. Please try again.`,
                    {
                        variant: 'error',
                    },
                );
            }
            return;
        },
        [data, postId, enqueueSnackbar],
    );

    if (isLoading) return null;

    if (error || !data?.success) return children;

    const frame: Frame = latestFrame ?? data.data.frame;

    return (
        <div className=" mt-4 rounded-xl text-sm">
            <div className="relative">
                {loading ? (
                    <div
                        className=" z10 absolute inset-0 overflow-hidden rounded-xl bg-white dark:bg-bg"
                        style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(4px)' }}
                    />
                ) : null}
                <Image
                    className="divider aspect-2 w-full rounded-xl object-cover"
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
                    <input
                        className="w-full rounded-md border border-line bg-white px-2 py-1.5 dark:bg-darkBottom dark:text-white"
                        type="text"
                        placeholder={frame.input.placeholder}
                        ref={inputRef}
                    />
                </div>
            ) : null}
            {frame.buttons.length ? (
                <div className="mt-2 flex gap-2">
                    {frame.buttons
                        .slice(0)
                        .sort((a, z) => a.index - z.index)
                        ?.map((button) => {
                            return (
                                <button
                                    className={classNames(
                                        'flex-1 rounded-md border border-line bg-white py-2 text-main disabled:opacity-70 dark:bg-darkBottom dark:text-white',
                                        {
                                            'hover:bg-bg': !loading,
                                            'hover:cursor-pointer': !loading,
                                        },
                                    )}
                                    disabled={loading}
                                    key={button.index}
                                    onClick={() => {
                                        if (!loading) handleClick(button, inputRef.current?.value);
                                    }}
                                >
                                    <span>{button.text}</span>
                                    {button.action === ActionType.PostRedirect ? (
                                        <LinkIcon width={20} height={20} />
                                    ) : null}
                                </button>
                            );
                        })}
                </div>
            ) : null}
        </div>
    );
}
