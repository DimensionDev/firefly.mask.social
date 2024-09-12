import { DiscoverPage } from '@/app/(normal)/pages/Discover.js';
import { type DiscoverSource, type SourceInURL } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: {
        source: SourceInURL;
    };
}

export default function Page({ params }: Props) {
    const source = resolveSourceFromUrl(params.source) as DiscoverSource;
    return <DiscoverPage source={source} />;
}
