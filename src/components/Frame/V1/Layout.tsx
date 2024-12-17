import { t } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, type ReactNode, useState } from 'react';
import { useAsyncFn } from 'react-use';
import urlcat from 'urlcat';
import { encodePacked, type Hex, isAddress, type SignTypedDataParameters } from 'viem';
import { getAccount } from 'wagmi/actions';
import { z } from 'zod';

import { Card } from '@/components/Frame/V1/Card.js';
import { simulate } from '@/components/TransactionSimulator/simulate.js';
import { config } from '@/configs/wagmiClient.js';
import { NODE_ENV, SimulateType, type SocialSource, Source } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { MalformedError, TransactionSimulationError } from '@/constants/error.js';
import { enqueueErrorMessage, enqueueMessageFromError } from '@/helpers/enqueueMessage.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { interceptExternalUrl } from '@/helpers/interceptExternalUrl.js';
import { openWindow } from '@/helpers/openWindow.js';
import { parseCAIP10 } from '@/helpers/parseCAIP10.js';
import { untilImageUrlLoaded } from '@/helpers/untilImageLoaded.js';
import { ConfirmLeavingModalRef, LoginModalRef } from '@/modals/controls.js';
import { HubbleFrameProvider } from '@/providers/hubble/Frame.js';
import { LensFrameProvider } from '@/providers/lens/Frame.js';
import type { Additional } from '@/providers/types/Frame.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getFrameMintTransaction } from '@/services/getFrameMintTransaction.js';
import { validateMessage } from '@/services/validateMessage.js';
import {
    ActionType,
    type FrameButton,
    type FrameV1,
    type LinkDigestedResponse,
    MethodType,
    type RedirectUrlResponse,
} from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

const TransactionSchema = z.object({
    // a CAIP-2 chain ID to identify the tx network
    chainId: z.string().refine((x) => x.startsWith('eip155:'), { message: 'Invalid chain ID format.' }),
    method: z.literal(MethodType.ETH_SEND_TRANSACTION),
    // identifying client in calldata
    // learn more: https://www.notion.so/warpcast/Frame-Transactions-Public-9d9f9f4f527249519a41bd8d16165f73?pvs=4#c1c3182208ce4ae4a7ffa72129b9795a
    attribution: z.boolean().optional(),
    params: z.object({
        // JSON ABI which must include encoded function type and should include potential error types. Can be empty.
        abi: z.union([z.object({}), z.array(z.object({})), z.string()]).optional(),
        to: z.string().refine((x) => isAddress(x), { message: 'Invalid address format.' }),
        value: z.string().optional(),
        data: z.string().optional(),
    }),
});

const SignTypedDataV4Schema = z.object({
    // a CAIP-2 chain ID to identify the tx network
    chainId: z.string().refine((x) => x.startsWith('eip155:'), { message: 'Invalid chain ID format.' }),
    method: z.literal(MethodType.ETH_SIGN_TYPED_DATA_V4),
    params: z.object({
        domain: z.object({
            name: z.string().optional(),
            version: z.string().optional(),
            chainId: z.union([z.number(), z.string()]).optional(),
            verifyingContract: z.string().optional(),
        }),
        types: z.record(z.unknown()),
        primaryType: z.string(),
        message: z.record(z.unknown()),
    }),
});

const WalletActionSchema = z.union([TransactionSchema, SignTypedDataV4Schema]);

async function getNextFrame(
    source: SocialSource,
    postId: string,
    frame: FrameV1,
    latestFrame: FrameV1 | null,
    button: FrameButton,
    input?: string,
) {
    async function createPacket(additional?: Additional) {
        switch (source) {
            case Source.Lens:
                return LensFrameProvider.generateSignaturePacket(postId, frame.url, button.index, input, {
                    state: latestFrame && frame.state ? frame.state : undefined,
                    ...additional,
                });
            case Source.Farcaster:
                return HubbleFrameProvider.generateSignaturePacket(postId, frame.url, button.index, input, {
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
            if (valid === true) console.log('[frame] valid signature packet:', packet);
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
                const response = await postAction<LinkDigestedResponse<FrameV1>>();
                const nextFrame = response.success ? (response.data.frame as FrameV1) : null;

                if (!nextFrame) {
                    enqueueErrorMessage(t`The frame server failed to process the request.`);
                    return null;
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
                    return null;
                }

                if (await ConfirmLeavingModalRef.openAndWaitForClose(redirectUrl)) openWindow(redirectUrl, '_blank');
                return null;
            }
            case ActionType.Link:
                if (!button.target) return null;

                const intercepted = await interceptExternalUrl(button.target);
                if (intercepted) return null;

                if (await ConfirmLeavingModalRef.openAndWaitForClose(button.target))
                    openWindow(button.target, '_blank');
                return null;
            case ActionType.Mint: {
                const mintTx = await getFrameMintTransaction(frame, button);
                if (mintTx && button.target) {
                    const { chainId } = parseCAIP10(button.target);
                    const client = await getWalletClientRequired(config, {
                        chainId,
                    });
                    if (client.chain.id !== chainId) throw new Error(t`The chainId mismatch.`);
                    await simulate({
                        type: SimulateType.Swap,
                        chainId,
                        url: frame.url,
                        transaction: mintTx,
                    });
                    await client.sendTransaction(mintTx);
                    return null;
                }

                if (await ConfirmLeavingModalRef.openAndWaitForClose(frame.url)) openWindow(frame.url, '_blank');
                return null;
            }
            case ActionType.Transaction:
                const address = getAccount(config)?.address;
                if (!address) {
                    await getWalletClientRequired(config);
                    return null;
                }
                const walletAction = await postAction<z.infer<typeof WalletActionSchema>>({
                    address,
                });
                if (!walletAction.success) throw new Error(t`Failed to parse transaction.`);

                const profile = getCurrentProfile(Source.Farcaster);
                if (!profile) throw new Error(t`Profile not found`);

                const action = WalletActionSchema.parse(walletAction.data);
                const { chainId } = parseCAIP10(action.chainId);
                const client = await getWalletClientRequired(config, {
                    chainId,
                });
                if (client.chain.id !== chainId) throw new Error(t`The chainId mismatch.`);

                const method = action.method;
                switch (method) {
                    case MethodType.ETH_SEND_TRANSACTION: {
                        const params = {
                            to: action.params.to as Hex,
                            data: (action.params.data ||
                                (action.attribution !== false
                                    ? encodePacked(['byte1', 'uint32'], [0xfc, Number.parseInt(profile.profileId, 10)])
                                    : undefined)) as Hex | undefined,
                            value: action.params.value ? BigInt(action.params.value) : BigInt(0),
                        };
                        await simulate({
                            url: frame.url,
                            chainId,
                            transaction: params,
                        });
                        const transactionId = await client.sendTransaction(params);
                        const response = await postAction<LinkDigestedResponse<FrameV1>>({
                            address,
                            transactionId,
                        });
                        return response.success ? response.data.frame : null;
                    }
                    case MethodType.ETH_SIGN_TYPED_DATA_V4: {
                        await simulate({ type: SimulateType.Signature, url: frame.url, chainId });
                        const signature = await client.signTypedData(action.params as SignTypedDataParameters);
                        const response = await postAction<LinkDigestedResponse<FrameV1>>({
                            address,
                            transactionId: signature,
                        });
                        return response.success ? response.data.frame : null;
                    }
                    default:
                        safeUnreachable(method);
                        enqueueErrorMessage(t`Unknown transaction method: ${method}.`);
                        return null;
                }
            default:
                safeUnreachable(button.action);
                return null;
        }
    } catch (error) {
        if (error instanceof TransactionSimulationError) return null;
        enqueueMessageFromError(error, t`Something went wrong. Please try again.`);
        throw error;
    }
}

interface FrameLayoutProps {
    frame: FrameV1;
    post: Post;
    children?: ReactNode;
}

export const FrameLayout = memo<FrameLayoutProps>(function FrameLayout({ children, post, ...props }) {
    const { source, postId } = post;
    const [latestFrame, setLatestFrame] = useState<FrameV1 | null>(null);
    const frame = latestFrame ?? props.frame;

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

    if (!frame) return children;

    return <Card frame={frame} source={source} loading={isLoadingNextFrame} onButtonClick={handleClick} />;
});
