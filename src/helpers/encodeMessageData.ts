import { FARCASTER_EPOCH, getFarcasterTime, HashScheme, Message, SignatureScheme } from '@farcaster/hub-web';
import * as ed from '@noble/ed25519';
import { blake3 } from '@noble/hashes/blake3';
import { sha512 } from '@noble/hashes/sha512';
import { toBytes } from 'viem';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { FarcasterNetwork, MessageData } from '@/providers/hubble/proto/message.js';
import type { PartialWith } from '@/types/index.js';

ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m));

export async function encodeMessageData(
    withMessageData: (profileId: number) => PartialWith<MessageData, 'fid' | 'timestamp' | 'network'>,
    withPrivateKey?: string,
) {
    const { token, profileId } = farcasterClient.getSessionRequired();
    const privateKey = withPrivateKey ?? token;
    const messageData: MessageData = {
        ...withMessageData(Number(profileId)),
        fid: Number(profileId),
        timestamp: getFarcasterTime().unwrapOr(Math.round((Date.now() - FARCASTER_EPOCH) / 1000)),
        network: FarcasterNetwork.MAINNET,
    };
    const messageDataEncoded = MessageData.encode(messageData).finish();
    const messageHash = blake3(messageDataEncoded, { dkLen: 20 });
    const messageSignature = await ed.signAsync(messageHash, toBytes(privateKey, { size: 32 }));

    const bytes = Buffer.from(
        Message.encode({
            data: messageData,
            hash: messageHash,
            hashScheme: HashScheme.BLAKE3,
            signature: messageSignature,
            signatureScheme: SignatureScheme.ED25519,
            signer: ed.getPublicKey(toBytes(privateKey)),
        }).finish(),
    );

    return {
        bytes,
        messageData,
        messageSignature,
        messageHash,
    };
}
