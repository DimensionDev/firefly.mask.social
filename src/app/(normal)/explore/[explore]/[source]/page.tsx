import { ExplorePage } from '@/app/(normal)/explore/pages/Explore.js';
import type { ExploreSource, ExploreType, SourceInURL } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        source: SourceInURL;
        explore: ExploreType;
    };
}

export default function Page({ params }: Props) {
    const source = resolveSourceFromUrl(params.source) as ExploreSource;

    return <ExplorePage source={source} type={params.explore} />;
}
