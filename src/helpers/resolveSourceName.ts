import { createLookupTableResolver } from '@masknet/shared-base';

import { Source } from '@/constants/enum.js';

export const resolveSourceName = createLookupTableResolver<Source, string>(
    {
        [Source.Lens]: 'Lens',
        [Source.Farcaster]: 'Farcaster',
        [Source.Twitter]: 'X',
        [Source.Article]: 'Articles',
        [Source.Wallet]: 'Wallets',
    },
    (source) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
