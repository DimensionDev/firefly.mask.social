import { createLookupTableResolver } from '@masknet/shared-base';
import { polygon } from 'viem/chains';

export const resolvePublicProviderUrl = createLookupTableResolver<number, string>(
    {
        [polygon.id]: 'https://polygon-rpc.com',
    },
    '',
);
