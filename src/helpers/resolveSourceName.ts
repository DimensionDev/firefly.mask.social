import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveSourceName = createLookupTableResolver<Source, string>(
    {
        [Source.Lens]: 'Lens',
        [Source.Farcaster]: 'Farcaster',
        [Source.Twitter]: 'X',
        [Source.Firefly]: 'Firefly',
        [Source.Article]: 'Articles',
        [Source.Wallet]: 'Wallets',
        [Source.NFTs]: 'NFTs',
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
