import { hashMessage, hexlify, recoverAddress } from 'ethers';
import canonicalize from 'canonicalize';
import { CustodyPayload } from './generateCustodyBearer';
import { isSameAddress } from './isSameAddress';

export function verifyCustodyBearer(token: string, payload: CustodyPayload, address: string) {
    const message = canonicalize(payload);
    if (!message) throw new Error('Failed to serialize payload.');
    const recoveredAddress = recoverAddress(hashMessage(message), hexlify(Buffer.from(token.split(':')[1], 'base64')));
    return isSameAddress(recoveredAddress, address);
}
