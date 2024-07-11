import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

function isTronAddress(address: string): boolean {
    return /^T[1-9A-HJ-NP-Za-km-z]{32,42}$|^T9[1-9A-HJ-NP-Za-km-z]{32,41}$/.test(address);
}

export function isValidSolanaAddress(address?: string, strict?: boolean): address is string {
    const length = address?.length;
    if (!length || length < 32 || length > 44) return false;
    try {
        const buffer = bs58.decode(address);
        return strict === false ? true : PublicKey.isOnCurve(buffer) && !isTronAddress(address);
    } catch {
        return false;
    }
}
