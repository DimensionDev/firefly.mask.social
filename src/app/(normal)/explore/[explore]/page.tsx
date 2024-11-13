import { ExplorePage } from '@/app/(normal)/explore/pages/Explore.js';
import { type ExploreType, Source } from '@/constants/enum.js';

interface Props {
    params: {
        explore: ExploreType;
    };
}

export default function Page({ params }: Props) {
    return <ExplorePage type={params.explore} source={Source.Farcaster} />;
}
