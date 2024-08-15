import { Factories, MessageType } from '@farcaster/core';
import { omitBy } from 'lodash-es';
import { toBytes } from 'viem';

import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import type { Provider } from '@/providers/types/Frame.js';
import type { FrameSignaturePacket } from '@/providers/types/Hubble.js';
import type { Index } from '@/types/frame.js';

class FrameProvider implements Provider<FrameSignaturePacket> {
    async generateSignaturePacket(
        postId: string,
        frameUrl: string,
        index: Index,
        input?: string,
        additional?: {
            // the state is not read from frame, for initial frame it should not provide state
            state?: string;
            address?: string;
            transactionId?: string;
        },
    ): Promise<FrameSignaturePacket> {
        const { messageBytes, messageData, messageDataHash } = await encodeMessageData(
            (fid) => ({
                type: MessageType.FRAME_ACTION,
                frameActionBody: {
                    url: toBytes(frameUrl),
                    buttonIndex: index,
                    castId: {
                        fid,
                        hash: toBytes(postId),
                    },
                    inputText: input ? toBytes(input) : new Uint8Array([]),
                    state: additional?.state ? toBytes(additional?.state) : new Uint8Array([]),
                    address: additional?.address ? toBytes(additional.address) : new Uint8Array([]),
                    transactionId: additional?.transactionId ? toBytes(additional.transactionId) : new Uint8Array([]),
                },
            }),
            async (messageData, signer) => {
                return Factories.FrameActionMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        const packet = {
            untrustedData: omitBy(
                {
                    fid: messageData.fid,
                    url: frameUrl,
                    messageHash: messageDataHash,
                    timestamp: messageData.timestamp,
                    network: messageData.network,
                    buttonIndex: index,
                    inputText: input,
                    state: additional?.state,
                    address: additional?.address,
                    transactionId: additional?.transactionId,
                    castId: {
                        fid: messageData.fid,
                        hash: postId,
                    },
                },
                (x) => typeof x === 'undefined' || x === '',
            ),
            trustedData: {
                // no 0x prefix
                messageBytes: Buffer.from(messageBytes).toString('hex'),
            },
        } as FrameSignaturePacket;

        if (typeof packet.untrustedData.state === 'undefined') delete packet.untrustedData.state;

        return packet;
    }
}

export const HubbleFrameProvider = new FrameProvider();
