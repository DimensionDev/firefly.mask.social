import { getPublicKeyAsync, sign } from '@noble/ed25519';
import { toHex } from 'viem';

export async function signWithED25519(text: string, privateKey: string) {
    return {
        message: toHex(text),
        signer: `0x${Buffer.from(await getPublicKeyAsync(privateKey)).toString('hex')}`,
        signature: `0x${Buffer.from(sign(toHex(text), privateKey)).toString('hex')}`,
    };
}
