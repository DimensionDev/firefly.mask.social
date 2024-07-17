import { FarcasterNetwork, Message, MessageData, NobleEd25519Signer } from '@farcaster/core';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import { toBytes } from 'viem';

import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { getPublicKeyInHex, signMessageInHex } from '@/helpers/ed25519.js';
import type { PartialWith } from '@/types/index.js';

export async function encodeMessageData(
    withMessageData: (profileId: number) => PartialWith<MessageData, 'type' | 'fid' | 'timestamp' | 'network'>,
    withMessage: (messageData: MessageData, signer: NobleEd25519Signer) => Promise<Message>,
) {
    const { token, profileId } = farcasterSessionHolder.sessionRequired;

    // token is the private key of signer
    const signer = new NobleEd25519Signer(toBytes(token));
    const fid = Number.parseInt(profileId, 10);

    // @ts-ignore timestamp is not needed
    const messageData: MessageData = {
        fid,
        network: FarcasterNetwork.MAINNET,
        ...withMessageData(fid),
    };
    const messageDataBytes = MessageData.encode(messageData).finish();
    const messageDataHash = blake3(messageDataBytes, { dkLen: 20 });

    const publicKey = await getPublicKeyInHex(signer);
    const signature = await signMessageInHex(signer, messageDataHash);

    const message = await withMessage(messageData, signer);
    const messageBytes = Message.encode(message).finish();

    if (!publicKey || !signature) {
        throw new Error('Invalid signer key or signature.');
    }

    return {
        signer: publicKey,
        messageBytes: Buffer.from(messageBytes),
        messageData,
        messageDataHash: `0x${bytesToHex(messageDataHash)}`,
        messageDataSignature: signature,
    } as const;
}
