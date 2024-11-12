import { TrendingType } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveTrendingName = createLookupTableResolver<TrendingType, string>(
    {
        [TrendingType.TopGainers]: 'Top Gainers',
        [TrendingType.TopLosers]: 'Top Losers',
        [TrendingType.Trending]: 'Trending',
        [TrendingType.Meme]: 'Meme',
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
