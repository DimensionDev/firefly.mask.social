import { hashMessage, recoverAddress, toHex } from 'viem';
import canonicalize from 'canonicalize';
import { CustodyPayload } from '@/helpers/generateCustodyBearer';
import { isSameAddress } from '@/helpers/isSameAddress';

export async function verifyCustodyBearer(token: string, payload: CustodyPayload, address: string) {
    const message = canonicalize(payload);
    if (!message) throw new Error('Failed to serialize payload.');
    const recoveredAddress = await recoverAddress({
        hash: hashMessage(message),
        signature: toHex(Buffer.from(token.split(':')[1], 'base64')),
    });
    return isSameAddress(recoveredAddress, address);
}
