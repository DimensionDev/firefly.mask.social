import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const getPlatformQueryKey = createLookupTableResolver<Source, string>(
    {
        [Source.Twitter]: 'twitterId',
        [Source.Lens]: 'lensId',
        [Source.Farcaster]: 'fid',
        [Source.Wallet]: 'address',
    } as Record<Source, string>,
    (source: Source) => {
        throw new UnreachableError('Unsupported source', source);
    },
);
