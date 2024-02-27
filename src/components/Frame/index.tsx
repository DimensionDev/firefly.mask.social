import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { openWindow } from '@masknet/shared-base-ui';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Button } from '@/components/Frame/Button.js';
import { Input } from '@/components/Frame/Input.js';
import { Image } from '@/esm/Image.js';
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
            if (!url || isValidDomain(url)) return;
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

    const frame: Frame | null = latestFrame ?? (data?.success ? data.data.frame : null);

    const [{ loading }, handleClick] = useAsyncFn(
        async (button: FrameButton, input?: string) => {
            try {
                if (!frame) return;

                const { action, index, target } = button;

                switch (action) {
                    case ActionType.Post:
                    case ActionType.PostRedirect:
                        const packet = await HubbleSocialMediaProvider.generateFrameSignaturePacket(
                            postId,
                            frame,
                            index,
                            input,
                        );

                        console.log('DEBUG: packet');
                        console.log(packet);

                        await HubbleSocialMediaProvider.validateMessage(packet.trustedData.messageBytes);

                        const url = urlcat('/api/frame', {
                            url: frame.url,
                            action,
                            'post-url': target || frame.postUrl || frame.url,
                        });
                        const response = await fetchJSON<ResponseJSON<LinkDigested | { redirectUrl: string }>>(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(packet),
                        });

                        if (action === ActionType.Post) {
                            const nextFrame = response.success ? (response.data as LinkDigested).frame : null;
                            if (!nextFrame)
                                return enqueueSnackbar(t`The frame server failed to process the request.`, {
                                    variant: 'error',
                                });

                            setLatestFrame(nextFrame);
                        } else if (action === ActionType.PostRedirect) {
                            const redirectUrl = response.success
                                ? (response.data as { redirectUrl: string }).redirectUrl
                                : null;
                            if (!redirectUrl)
                                return enqueueSnackbar(t`The frame server failed to process the request.`, {
                                    variant: 'error',
                                });

                            openWindow(redirectUrl, '_blank');
                        }
                        break;
                    case ActionType.Link:
                        if (button.target) openWindow(button.target, '_blank');
                        break;
                    case ActionType.Mint:
                        enqueueSnackbar(t`Mint button is not available yet.`);
                        break;
                    default:
                        safeUnreachable(action);
                        break;
                }
            } catch (error) {
                enqueueSnackbar(error instanceof Error ? error.message : t`Something went wrong. Please try again.`, {
                    variant: 'error',
                });
            }
            return;
        },
        [frame, postId, enqueueSnackbar],
    );

    if (isLoading) return null;

    if (error || !frame) return children;

    return (
        <div className=" mt-4 rounded-xl border border-line bg-bg p-2 text-sm">
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
                    <Input input={frame.input} ref={inputRef} />
                </div>
            ) : null}
            {frame.buttons.length ? (
                <div className="mt-2 flex gap-2">
                    {frame.buttons
                        .slice(0)
                        .sort((a, z) => a.index - z.index)
                        ?.map((button) => (
                            <Button
                                key={button.index}
                                button={button}
                                disabled={loading}
                                onClick={() => {
                                    if (!loading) handleClick(button, inputRef.current?.value);
                                }}
                            />
                        ))}
                </div>
            ) : null}
        </div>
    );
}
