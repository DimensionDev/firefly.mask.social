import { NobleEd25519Signer } from '@farcaster/core';
import { bytesToHex } from '@noble/hashes/utils';

export async function getPublicKeyInHex(signer: NobleEd25519Signer) {
    const publicKey = await signer.getSignerKey();
    if (publicKey.isErr()) return null;
    return `0x${bytesToHex(publicKey.value)}` as `0x${string}`;
}

export async function signMessageInHex(signer: NobleEd25519Signer, message: Uint8Array) {
    const signature = await signer.signMessageHash(message);
    if (signature.isErr()) return null;
    return `0x${bytesToHex(signature.value)}` as `0x${string}`;
}
