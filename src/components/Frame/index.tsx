import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { openWindow } from '@masknet/shared-base-ui';
import { attemptUntil } from '@masknet/web3-shared-base';
import { isValidAddress, isValidDomain } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { isUndefined } from 'lodash-es';
import { memo, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { encodePacked } from 'viem';
import { z } from 'zod';

import { Card } from '@/components/Frame/Card.js';
import { config } from '@/configs/wagmiClient.js';
import { NODE_ENV, type SocialSource, Source } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { MalformedError } from '@/constants/error.js';
import { MAX_FRAME_SIZE_PER_POST } from '@/constants/index.js';
import { ServerErrorCodes } from '@/helpers/createErrorResponseJSON.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { parseCAIP10 } from '@/helpers/parseCAIP10.js';
import { resolveMintUrl } from '@/helpers/resolveMintUrl.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { untilImageUrlLoaded } from '@/helpers/untilImageLoaded.js';
import { ConfirmModalRef, LoginModalRef } from '@/modals/controls.js';
import { HubbleFrameProvider } from '@/providers/hubble/Frame.js';
import { LensFrameProvider } from '@/providers/lens/Frame.js';
import type { Additional } from '@/providers/types/Frame.js';
import { validateMessage } from '@/services/validateMessage.js';
import {
    ActionType,
    type Frame as FrameType,
    type FrameButton,
    type LinkDigestedResponse,
    MethodType,
    type RedirectUrlResponse,
} from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

export const TransactionSchema = z.object({
    // a CAIP-2 chain ID to identify the tx network
    chainId: z.string().refine((x) => x.startsWith('eip155:'), { message: 'Invalid chain ID format.' }),
    method: z.enum([MethodType.ETH_SEND_TRANSACTION]),
    // identifying client in calldata
    // learn more: https://www.notion.so/warpcast/Frame-Transactions-Public-9d9f9f4f527249519a41bd8d16165f73?pvs=4#c1c3182208ce4ae4a7ffa72129b9795a
    attribution: z.boolean().optional(),
    params: z.object({
        // JSON ABI which must include encoded function type and should include potential error types. Can be empty.
        abi: z.union([z.object({}), z.array(z.object({}))]).optional(),
        to: z.string().refine((x) => isValidAddress(x), { message: 'Invalid address format.' }),
        value: z.string().optional(),
        data: z.string().optional(),
    }),
});

function confirmBeforeLeaving() {
    return ConfirmModalRef.openAndWaitForClose({
        title: t`Leaving Firefly`,
        content: (
            <div className="text-main">
                <Trans>
                    Please be cautious when connecting your wallet, as malicious websites may attempt to access your
                    funds.
                </Trans>
            </div>
        ),
    });
}

async function getNextFrame(
    source: SocialSource,
    postId: string,
    frame: FrameType,
    latestFrame: FrameType | null,
    button: FrameButton,
    input?: string,
) {
    async function createPacket(additional?: Additional) {
        switch (source) {
            case Source.Lens:
                return LensFrameProvider.generateSignaturePacket(postId, frame, button.index, input, {
                    state: latestFrame && frame.state ? frame.state : undefined,
                    ...additional,
                });
            case Source.Farcaster:
                return HubbleFrameProvider.generateSignaturePacket(postId, frame, button.index, input, {
                    state: latestFrame && frame.state ? frame.state : undefined,
                    ...additional,
                });
            case Source.Twitter:
                return null;
            default:
                safeUnreachable(source);
                return null;
        }
    }

    async function postAction<T>(additional?: Additional) {
        const packet = await createPacket(additional);
        if (!packet) {
            enqueueErrorMessage(t`Failed to generate signature packet with source = ${source}.`);
            throw new Error('Failed to generate signature packet.');
        }

        // validate the signature packet in development
        if (env.shared.NODE_ENV === NODE_ENV.Development) {
            const valid = await validateMessage(packet.trustedData.messageBytes, source);
            if (valid === true) console.log('Valid signature packet:', packet);
            else throw new MalformedError('Invalid frame packet.');
        }

        const url = urlcat('/api/frame', {
            url: frame.url,
            action: button.action,
            target: button.target,
            'post-url': button.postUrl || frame.postUrl,
        });
        return fetchJSON<ResponseJSON<T>>(url, {
            method: 'POST',
            body: JSON.stringify(packet),
        });
    }

    try {
        switch (button.action) {
            case ActionType.Post: {
                const response = await postAction<LinkDigestedResponse>();
                const nextFrame = response.success ? response.data.frame : null;

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
            }
            case ActionType.PostRedirect: {
                const response = await postAction<RedirectUrlResponse>();
                const redirectUrl = response.success ? response.data.redirectUrl : null;
                if (!redirectUrl) {
                    enqueueErrorMessage(t`The frame server failed to process the request.`);
                    return;
                }

                if (await confirmBeforeLeaving()) openWindow(redirectUrl, '_blank');
                return;
            }
            case ActionType.Link:
                if (!button.target) return;
                if (await confirmBeforeLeaving()) openWindow(button.target, '_blank');
                return;
            case ActionType.Mint: {
                if (!button.target) return;
                const mintUrl = resolveMintUrl(button.target);
                if (!mintUrl) {
                    enqueueErrorMessage(t`Failed to resolve mint URL = ${button.target}.`);
                    return;
                }
                if (await confirmBeforeLeaving()) openWindow(mintUrl, '_blank');
                return;
            }
            case ActionType.Transaction:
                const txResponse = await postAction<z.infer<typeof TransactionSchema>>();
                if (!txResponse.success) throw new Error(t`Failed to parse transaction.`);

                const profile = getCurrentProfile(Source.Farcaster);
                if (!profile) throw new Error(t`Profile not found`);

                const transaction = TransactionSchema.parse(txResponse.data);
                const { chainId } = parseCAIP10(transaction.chainId);
                const client = await getWalletClientRequired(config, {
                    chainId,
                });

                if (client.chain.id !== chainId) throw new Error(t`The chainId mismatch.`);

                switch (transaction.method) {
                    case MethodType.ETH_SEND_TRANSACTION: {
                        const transactionId = await client.sendTransaction({
                            to: transaction.params.to as `0x${string}`,
                            data: (transaction.params.data ||
                                (transaction.attribution !== false
                                    ? encodePacked(['byte1', 'uint32'], [0xfc, Number.parseInt(profile.profileId, 10)])
                                    : undefined)) as `0x${string}` | undefined,
                            value: transaction.params.value ? BigInt(transaction.params.value) : BigInt(0),
                        });

                        const response = await postAction<LinkDigestedResponse>({
                            transactionId,
                        });
                        return response.success ? response.data.frame : null;
                    }
                    default:
                        safeUnreachable(transaction.method);
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
    source: SocialSource;
    urls: string[];
    postId: string;
    children: React.ReactNode;
    onData?: (frame: FrameType) => void;
}

export const Frame = memo<FrameProps>(function Frame({ postId, source, urls, onData, children }) {
    const [latestFrame, setLatestFrame] = useState<FrameType | null>(null);

    const {
        isLoading: isLoadingFrame,
        error,
        data,
    } = useQuery({
        queryKey: ['frame', ...urls],
        queryFn: async () => {
            // TODO: if multiple frames are supported, we should refactor this part
            if (MAX_FRAME_SIZE_PER_POST > 1 && urls.length > 1)
                console.warn(
                    '[frame]: Multiple frames found for this post. Only the first available frame will be used.',
                );

            try {
                const result = await attemptUntil(
                    urls.map((x) => async () => {
                        if (!x || isValidDomain(x)) return;
                        return fetchJSON<ResponseJSON<LinkDigestedResponse>>(
                            urlcat('/api/frame', {
                                link: (await resolveTCOLink(x)) ?? x,
                            }),
                        );
                    }),
                    { success: false, error: { message: 'fetch error', code: 40001 } },
                    (response) => {
                        if (isUndefined(response)) return true;
                        return !response?.success;
                    },
                );

                return result;
            } catch (error) {
                return {
                    success: false,
                    error: { message: error instanceof Error ? error.message : '', code: ServerErrorCodes.UNKNOWN },
                } as ResponseJSON<LinkDigestedResponse>;
            }
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

    const frame: FrameType | null = latestFrame ?? (data?.success ? data.data.frame : null);

    const [{ loading: isLoadingNextFrame }, handleClick] = useAsyncFn(
        async (button: FrameButton, input?: string) => {
            if (!frame) return;

            if (![ActionType.Link, ActionType.Mint].includes(button.action) && !getCurrentProfile(source)) {
                LoginModalRef.open({
                    source,
                });
                return;
            }

            const nextFrame = await getNextFrame(source, postId, frame, latestFrame, button, input);
            if (nextFrame) setLatestFrame(nextFrame);
        },
        [source, frame, latestFrame, postId],
    );

    if (isLoadingFrame) return null;

    if (error || !frame) return children;

    return <Card frame={frame} source={source} loading={isLoadingNextFrame} onButtonClick={handleClick} />;
});
