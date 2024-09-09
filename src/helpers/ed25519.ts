import { NobleEd25519Signer } from '@farcaster/core';
import { bytesToHex } from '@noble/hashes/utils';
import { toBytes } from 'viem';

import type { FarcasterSession } from '@/providers/farcaster/Session.js';

export async function getPublicKeyInHexFromSigner(signer: NobleEd25519Signer) {
    const publicKey = await signer.getSignerKey();
    if (publicKey.isErr()) return null;
    return `0x${bytesToHex(publicKey.value)}` as `0x${string}`;
}

export async function signMessageInHexFromSigner(signer: NobleEd25519Signer, message: Uint8Array) {
    const signature = await signer.signMessageHash(message);
    if (signature.isErr()) return null;
    return `0x${bytesToHex(signature.value)}` as `0x${string}`;
}

export async function getPublicKeyInHexFromSession(session: FarcasterSession) {
    const signer = new NobleEd25519Signer(toBytes(session.token));
    return getPublicKeyInHexFromSigner(signer);
}

export async function signMessageInHexFromSession(session: FarcasterSession, message: Uint8Array) {
    const signer = new NobleEd25519Signer(toBytes(session.token));
    return signMessageInHexFromSigner(signer, message);
}
