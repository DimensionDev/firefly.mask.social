
import { ExploreDetailPage } from '@/app/(normal)/explore/pages/DetailPage.js';
import { type SourceInURL } from '@/constants/enum.js';
import { isBotRequest } from '@/helpers/isBotRequest.js';

interface Props {
    searchParams: {
        source: SourceInURL;
    };
}

// export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
//     if (isBotRequest() && searchParams.source)
//         return getChannelOGByIdRedis(searchParams.source as SourceInURL, params.id);
//     return createSiteMetadata();
// }
export default function Page(props: Props) {
    if (isBotRequest()) return null;

    return <ExploreDetailPage {...props} />;
}
