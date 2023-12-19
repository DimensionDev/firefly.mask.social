import { toInteger } from 'lodash-es';
import { numberToHex } from 'viem';

export function toFid(profileId: string) {
    // fid should be even length
    return numberToHex(toInteger(profileId), { size: 32 });
}
