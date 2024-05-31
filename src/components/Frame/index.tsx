import { t, Trans } from '@lingui/macro';
import { getEnumAsArray, safeUnreachable } from '@masknet/kit';
import { openWindow } from '@masknet/shared-base-ui';
import { attemptUntil } from '@masknet/web3-shared-base';
import { isValidDomain } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { encodePacked } from 'viem';
import { z } from 'zod';

import { Card } from '@/components/Frame/Card.js';
import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { MAX_FRAME_SIZE_PER_POST } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { untilImageUrlLoaded } from '@/helpers/untilImageLoaded.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { type Additional, generateFrameSignaturePacket } from '@/services/generateFrameSignaturePacket.js';
import {
    ActionType,
    type Frame,
    type FrameButton,
    type LinkDigestedResponse,
    MethodType,
    type RedirectUrlResponse,
    type TransactionResponse,
} from '@/types/frame.js';
import { ChainId } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

function parseChainId(chainId: `eip155:${number}`): ChainId {
    const chainIdParsed = Number.parseInt(chainId.split(':')[1], 10);
    if (isNaN(chainIdParsed) || chainIdParsed <= 0) throw new Error(`Invalid chain ID: ${chainId}`);
    if (!getEnumAsArray(ChainId).find((x) => x.value === chainIdParsed))
        throw new Error(`Unsupported chain ID: ${chainId}`);
    return chainIdParsed;
}

const TransactionSchema = z.custom<TransactionResponse>((value) => {
    return true;
});

async function getNextFrame(
    postId: string,
    frame: Frame,
    latestFrame: Frame | null,
    button: FrameButton,
    input?: string,
) {
    try {
        function confirmBeforeLeaving() {
            return ConfirmModalRef.openAndWaitForClose({
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
        }

        async function postAction<T>(additional?: Additional) {
            const url = urlcat('/api/frame', {
                url: frame.url,
                action: button.action,
                'post-url': button.target || frame.postUrl || frame.url,
            });
            const packet = await generateFrameSignaturePacket(postId, frame, button.index, input, {
                // for initial frame should not provide state
                state: latestFrame && frame.state ? frame.state : undefined,
                ...additional,
            });

            return fetchJSON<ResponseJSON<T>>(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packet),
            });
        }

        switch (button.action) {
            case ActionType.Post:
                const postResponse = await postAction<LinkDigestedResponse>();
                const nextFrame = postResponse.success ? postResponse.data.frame : null;

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
                const redirectUrlResponse = await postAction<RedirectUrlResponse>();
                const redirectUrl = redirectUrlResponse.success ? redirectUrlResponse.data.redirectUrl : null;
                if (!redirectUrl) {
                    enqueueErrorMessage(t`The frame server failed to process the request.`);
                    return;
                }

                if (await confirmBeforeLeaving()) openWindow(redirectUrl, '_blank');
                return;
            case ActionType.Link:
                if (!button.target) return;
                if (await confirmBeforeLeaving()) openWindow(button.target, '_blank');
                return;
            case ActionType.Mint:
                enqueueErrorMessage(t`Mint button is not available yet.`);
                return;
            case ActionType.Transaction:
                const txResponse = await postAction<TransactionResponse>();
                if (!txResponse.success) throw new Error('Failded to parse transaction.');

                const profile = getCurrentProfile(Source.Farcaster);
                if (!profile) throw new Error('Profile not found');

                const transaction = TransactionSchema.parse(txResponse.data);
                const client = await getWalletClientRequired(config);

                if (client.chain.id !== transaction.parsedChainId) {
                    await client.switchChain({
                        id: transaction.parsedChainId,
                    });
                }

                if (transaction.method === MethodType.ETH_SEND_TRANSACTION) {
                    const transactionId = await client.sendTransaction({
                        to: transaction.params.to,
                        data:
                            transaction.params.data ||
                            (transaction.attribution !== false
                                ? encodePacked(['byte1', 'uint32'], [0xfc, Number.parseInt(profile.profileId, 10)])
                                : undefined),
                        value: transaction.params.parsedValue,
                    });

                    const response = await postAction<LinkDigestedResponse>({
                        transactionId,
                    });
                    return response.success ? response.data.frame : null;
                } else {
                    enqueueErrorMessage(t`Unknown transaction method: ${transaction.method}.`);
                    return;
                }
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
                    return fetchJSON<ResponseJSON<LinkDigestedResponse>>(
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
