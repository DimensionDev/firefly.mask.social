import { Factories, MessageType, toFarcasterTime } from '@farcaster/core';

import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import type { SignaturePacket } from '@/providers/types/Hubble.js';

export async function generateSignaturePacket(): Promise<SignaturePacket> {
    const { signer, messageDataHash, messageDataSignature } = await encodeMessageData(
        () => {
            return {
                type: MessageType.CAST_ADD,
                timestamp: toFarcasterTime(Date.now())._unsafeUnwrap(),
                castAddBody: undefined,
            };
        },
        async (messageData, signer) => {
            return Factories.CastAddMessage.create(
                {
                    data: messageData,
                },
                {
                    transient: { signer },
                },
            );
        },
    );
    return {
        signer,
        messageHash: messageDataHash,
        messageSignature: messageDataSignature,
    };
}
