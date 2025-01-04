import { DiscoverPage } from '@/app/(normal)/discover/pages/Discover.js';
import { type DiscoverSource, type SourceInURL } from '@/constants/enum.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: Promise<{
        source: SourceInURL;
    }>;
}

export default async function Page(props: Props) {
    const params = await props.params;
    const source = resolveSourceFromUrl(params.source) as DiscoverSource;
    return <DiscoverPage source={source} />;
}
