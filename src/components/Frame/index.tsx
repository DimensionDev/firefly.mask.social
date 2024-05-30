import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { openWindow } from '@masknet/shared-base-ui';
import { attemptUntil } from '@masknet/web3-shared-base';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';

import { Card } from '@/components/Frame/Card.js';
import { MAX_FRAME_SIZE_PER_POST } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { untilImageUrlLoaded } from '@/helpers/untilImageLoaded.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { ActionType, type Frame, type FrameButton, type LinkDigested } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

async function getNextFrame(
    postId: string,
    frame: Frame,
    latestFrame: Frame | null,
    button: FrameButton,
    input?: string,
) {
    try {
        const confirm = () =>
            ConfirmModalRef.openAndWaitForClose({
                title: t`Leaving Firefly`,
                content: (
                    <div className=" text-main">
                        <Trans>
                            Please be cautious when connecting your wallet, as malicious websites may attempt to access
                            your funds.
                        </Trans>
                    </div>
                ),
            });

        const post = async () => {
            const url = urlcat('/api/frame', {
                url: frame.url,
                action,
                'post-url': button.target || frame.postUrl || frame.url,
            });
            const packet = await HubbleSocialMediaProvider.generateFrameSignaturePacket(
                postId,
                frame,
                button.index,
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

        switch (button.action) {
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

                return nextFrame;
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
                return;
            case ActionType.Link:
                if (!button.target) return;
                if (await confirm()) openWindow(button.target, '_blank');
                return;
            case ActionType.Mint:
                enqueueErrorMessage(t`Mint button is not available yet.`);
                return;
            case ActionType.Transaction:
                enqueueErrorMessage(t`Transaction button is not available yet.`);
                return;
            default:
                safeUnreachable(button.action);
                return;
        }
    } catch (error) {
        enqueueErrorMessage(t`Something went wrong. Please try again.`, {
            error,
        });
        throw error;
    }
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
            // TODO: if multiple frames are supported, we should refactor this part
            if (MAX_FRAME_SIZE_PER_POST > 1 && urls.length > 1)
                console.warn(
                    '[frame]: Multiple frames found for this post. Only the first available frame will be used.',
                );

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
            if (!frame) return;
            const nextFrame = await getNextFrame(postId, frame, latestFrame, button, input);
            if (nextFrame) setLatestFrame(nextFrame);
        },
        [frame, latestFrame, postId],
    );

    if (isLoadingFrame) return null;

    if (error || !frame) return children;

    return <Card frame={frame} loading={isLoadingNextFrame} onButtonClick={handleClick} />;
}
