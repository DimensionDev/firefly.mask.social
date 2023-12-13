import { Message } from '@farcaster/hub-web';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { blake3 } from 'hash-wasm';
import { toBytes } from 'viem';

import { warpcastClient } from '@/configs/warpcastClient.js';
import { FarcasterNetwork, HashScheme, MessageData, SignatureScheme } from '@/providers/hubble/proto/message.js';
import type { PartialWith } from '@/types/index.js';

ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m));

export async function encodeMessageData(
    withMessageData: (profileId: number) => PartialWith<MessageData, 'fid' | 'timestamp' | 'network'>,
    withPrivateKey?: string,
) {
    const { token, profileId } = warpcastClient.getSessionRequired();
    const privateKey = withPrivateKey ?? token;
    const messageData: MessageData = {
        ...withMessageData(Number(profileId)),
        fid: Number(profileId),
        timestamp: Math.floor(Date.now() / 1000),
        network: FarcasterNetwork.MAINNET,
    };
    const messageDataEncoded = MessageData.encode(messageData).finish();
    const messageSignature = await ed.signAsync(messageDataEncoded, toBytes(privateKey));
    const messageHash = await blake3(messageDataEncoded);

    const bytes = Buffer.from(
        Message.encode({
            data: messageData,
            hash: toBytes(messageHash),
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
