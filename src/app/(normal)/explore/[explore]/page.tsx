import { redirect, RedirectType } from 'next/navigation.js';

import { ExploreType, Source, TrendingType } from '@/constants/enum.js';
import { resolveExploreUrl } from '@/helpers/resolveExploreUrl.js';

interface Props {
    params: {
        explore: ExploreType;
    };
}

export default function Page({ params }: Props) {
    redirect(
        resolveExploreUrl(
            params.explore,
            params.explore === ExploreType.CryptoTrends ? TrendingType.TopGainers : Source.Farcaster,
        ),
        RedirectType.replace,
    );
}
