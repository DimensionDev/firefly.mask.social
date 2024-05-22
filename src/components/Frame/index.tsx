import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { openWindow } from '@masknet/shared-base-ui';
import { attemptUntil } from '@masknet/web3-shared-base';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Button } from '@/components/Frame/Button.js';
import { Input } from '@/components/Frame/Input.js';
import { Image } from '@/components/Image.js';
import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { untilImageUrlLoaded } from '@/helpers/untilImageLoaded.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { ActionType, type Frame, type FrameButton, type LinkDigested } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

interface FrameUIProps {
    frame: Frame;
    readonly?: boolean;
    loading?: boolean;
    onButtonClick?: (button: FrameButton, input?: string) => Promise<void>;
}

export function FrameUI({ frame, readonly = false, loading = false, onButtonClick }: FrameUIProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            className=" mt-4 w-full rounded-xl border border-line bg-bg p-2 text-sm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative w-full">
                {loading ? (
                    <div
                        className=" z10 absolute inset-0 overflow-hidden rounded-xl bg-white dark:bg-bg"
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

interface FrameProps {
    urls: string[];
    postId: string;
    children?: React.ReactNode;
    onData?: (frame: Frame) => void;
}

export function Frame({ postId, urls, onData, children }: FrameProps) {
    const [latestFrame, setLatestFrame] = useState<Frame | null>(null);

    const {
        isLoading: isLoadingFrame,
        error,
        data,
    } = useQuery({
        queryKey: ['frame', ...urls],
        queryFn: () => {
            return attemptUntil(
                urls.map((x) => () => {
                    if (!x || isValidDomain(x)) return;
                    return fetchJSON<ResponseJSON<LinkDigested>>(
                        urlcat('/api/frame', {
                            link: x,
                        }),
                    );
                }),
                undefined,
                (response) => {
                    if (isUndefined(response)) return true;
                    return !response?.success;
                },
            );
        },
        enabled: !!urls.length,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (!data?.success || !data?.data?.frame) return;
        onData?.(data.data.frame);
    }, [data, onData]);

    const frame: Frame | null = latestFrame ?? (data?.success ? data.data.frame : null);

    const [{ loading: isLoadingNextFrame }, handleClick] = useAsyncFn(
        async (button: FrameButton, input?: string) => {
            try {
                if (!frame) return;

                const { action, index, target } = button;

                const confirm = () =>
                    ConfirmModalRef.openAndWaitForClose({
                        title: t`Leaving Firefly`,
                        content: (
                            <div className=" text-main">
                                <Trans>
                                    Please be cautious when connecting your wallet, as malicious websites may attempt to
                                    access your funds.
                                </Trans>
                            </div>
                        ),
                    });

                const post = async () => {
                    const url = urlcat('/api/frame', {
                        url: frame.url,
                        action,
                        'post-url': target || frame.postUrl || frame.url,
                    });
                    const packet = await HubbleSocialMediaProvider.generateFrameSignaturePacket(
                        postId,
                        frame,
                        index,
                        input,
                        // for initial frame should not provide state
                        latestFrame && frame.state ? frame.state : undefined,
                    );

                    return fetchJSON<ResponseJSON<LinkDigested | { redirectUrl: string }>>(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(packet),
                    });
                };

                switch (action) {
                    case ActionType.Post:
                        const postResponse = await post();
                        const nextFrame = postResponse.success ? (postResponse.data as LinkDigested).frame : null;

                        if (!nextFrame) {
                            enqueueErrorMessage(t`The frame server failed to process the request.`);
                            return;
                        }

                        // in case the image loaded after loading state is set to false
                        if (nextFrame.image.url) {
                            try {
                                await untilImageUrlLoaded(nextFrame.image.url, AbortSignal.timeout(3_000));
                            } catch {
                                // ignore
                            }
                        }

                        setLatestFrame(nextFrame);
                        break;
                    case ActionType.PostRedirect:
                        const postRedirectResponse = await post();
                        const redirectUrl = postRedirectResponse.success
                            ? (postRedirectResponse.data as { redirectUrl: string }).redirectUrl
                            : null;
                        if (!redirectUrl) {
                            enqueueErrorMessage(t`The frame server failed to process the request.`);
                            return;
                        }

                        if (await confirm()) openWindow(redirectUrl, '_blank');
                        break;
                    case ActionType.Link:
                        if (!button.target) return;
                        if (await confirm()) openWindow(button.target, '_blank');
                        break;
                    case ActionType.Mint:
                        enqueueErrorMessage(t`Mint button is not available yet.`);
                        break;
                    case ActionType.Transaction:
                        enqueueErrorMessage(t`Transaction button is not available yet.`);
                        break;
                    default:
                        safeUnreachable(action);
                        break;
                }
            } catch (error) {
                enqueueErrorMessage(t`Something went wrong. Please try again.`, {
                    error,
                });
                throw error;
            }
            return;
        },
        [frame, latestFrame, postId],
    );

    if (isLoadingFrame) return null;

    if (error || !frame) return children;

    return <FrameUI frame={frame} loading={isLoadingNextFrame} onButtonClick={handleClick} />;
}
