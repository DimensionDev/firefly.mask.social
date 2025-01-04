import { ExplorePage } from '@/app/(normal)/explore/pages/Explore.js';
import { type ExploreSource, ExploreType, type SourceInURL, type TrendingType } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: Promise<{
        source: SourceInURL | TrendingType;
        explore: ExploreType;
    }>;
}

export default async function Page(props: Props) {
    const params = await props.params;
    return (
        <ExplorePage
            source={
                params.explore === ExploreType.CryptoTrends
                    ? (params.source as TrendingType)
                    : (resolveSourceFromUrl(params.source) as ExploreSource)
            }
            type={params.explore}
        />
    );
}
