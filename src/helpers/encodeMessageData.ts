import { Message } from '@farcaster/hub-web';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { blake3 } from 'hash-wasm';
import { toBytes } from 'viem';

import { HashScheme, MessageData, SignatureScheme } from '@/providers/hubble/proto/message.js';

ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m));

export async function encodeMessageData(messageData: MessageData, privateKey: string) {
    const encodedData = MessageData.encode(messageData).finish();

    const messageSignature = await ed.signAsync(encodedData, toBytes(privateKey));
    const messageHash = await blake3(encodedData);

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
