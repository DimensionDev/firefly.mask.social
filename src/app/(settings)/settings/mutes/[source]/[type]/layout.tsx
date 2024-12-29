import { t } from '@lingui/macro';

import { MuteType, Source, SourceInURL } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface PageProps {
    params: Promise<{
        source: SourceInURL;
        type: MuteType;
    }>;
}

export async function generateMetadata(props: PageProps) {
    const params = await props.params;
    const { source, type } = params;

    const menuNameMap: Record<string, string> = {
        [`${SourceInURL.Farcaster}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Farcaster)} Users`,
        [`${SourceInURL.Farcaster}_${MuteType.Channel}`]: t`${resolveSourceName(Source.Farcaster)} Channels`,
        [`${SourceInURL.Lens}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Lens)} Users`,
        [`${SourceInURL.Twitter}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Twitter)} Users`,
        [`${SourceInURL.Firefly}_${MuteType.Wallet}`]: t`Wallets`,
    };
    return createSiteMetadata({
        title: await createPageTitleSSR(menuNameMap[`${source}_${type}`]),
    });
}

export default function MutesListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
