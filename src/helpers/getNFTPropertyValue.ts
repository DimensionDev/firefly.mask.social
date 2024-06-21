import type { NonFungibleTokenTrait } from '@masknet/web3-shared-base';

import { getNFTPropertyDateString } from '@/helpers/getNFTPropertyDateString.js';

export function getNFTPropertyValue(displayType: NonFungibleTokenTrait['displayType'], value: string) {
    switch (displayType) {
        case 'date':
            return getNFTPropertyDateString(value);
        default:
            return value;
    }
}
