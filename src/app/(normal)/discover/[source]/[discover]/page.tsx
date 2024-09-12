import { DiscoverPage } from '@/app/(normal)/pages/Discover.js';
import { DiscoverType, type SocialDiscoverSource, SourceInURL } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        source: SourceInURL;
        discover: DiscoverType;
    };
}

export default function Page({ params }: Props) {
    const source = resolveSourceFromUrl(params.source) as SocialDiscoverSource;
    console.log('source: ', source);
    return <DiscoverPage source={source} discover={params.discover} />;
}
