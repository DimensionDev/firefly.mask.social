import { FarcasterNetwork, Message, MessageData, NobleEd25519Signer } from '@farcaster/core';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';
import { toBytes } from 'viem';

import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { PartialWith } from '@/types/index.js';

export async function encodeMessageData(
    withMessageData: (profileId: number) => PartialWith<MessageData, 'type' | 'fid' | 'timestamp' | 'network'>,
    withMessage: (messageData: MessageData, signer: NobleEd25519Signer) => Promise<Message>,
) {
    const { token, profileId } = farcasterSessionHolder.sessionRequired;
    const privateKey = token;
    const signer = new NobleEd25519Signer(toBytes(privateKey));

    const fid = Number.parseInt(profileId, 10);

    // @ts-ignore timestamp is not needed
    const messageData: MessageData = {
        fid,
        network: FarcasterNetwork.MAINNET,
        ...withMessageData(fid),
    };
    const messageDataBytes = MessageData.encode(messageData).finish();
    const messageDataHash = blake3(messageDataBytes, { dkLen: 20 });

    const message = await withMessage(messageData, signer);
    const messageBytes = Message.encode(message).finish();

    const signerKeyResult = await signer.getSignerKey();
    const signatureResult = await signer.signMessageHash(messageDataHash);

    if (signerKeyResult.isErr() || signatureResult.isErr()) {
        throw new Error('Invalid signer key or signature.');
    }

    return {
        signer: `0x${bytesToHex(signerKeyResult.value)}`,
        messageBytes: Buffer.from(messageBytes),
        messageData,
        messageDataHash: `0x${bytesToHex(messageDataHash)}`,
        messageDataSignature: `0x${bytesToHex(signatureResult.value)}`,
    } as const;
}
