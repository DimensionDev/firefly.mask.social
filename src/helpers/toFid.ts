import { toInteger } from 'lodash-es';
import { numberToHex } from 'viem';

export function toFid(profileId: string) {
    return numberToHex(toInteger(profileId));
}
