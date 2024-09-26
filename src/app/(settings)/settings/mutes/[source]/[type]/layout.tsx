import { t } from '@lingui/macro';

import { MuteType, Source, SourceInURL } from '@/constants/enum.js';
import { createPageTitle, createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';

interface PageProps {
    params: {
        source: SourceInURL;
        type: MuteType;
    };
}

export async function generateMetadata({ params: { source, type } }: PageProps) {
    const menuNameMap: Record<string, string> = {
        [`${SourceInURL.Farcaster}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Farcaster)} Users`,
        [`${SourceInURL.Farcaster}_${MuteType.Channel}`]: t`${resolveSourceName(Source.Farcaster)} Channels`,
        [`${SourceInURL.Lens}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Lens)} Users`,
        [`${SourceInURL.Twitter}_${MuteType.Profile}`]: t`${resolveSourceName(Source.Twitter)} Users`,
        [`${SourceInURL.Firefly}_${MuteType.Wallet}`]: t`Wallets`,
    };
    return createSiteMetadata({
        title: createPageTitle(createPageTitleSSR(menuNameMap[`${source}_${type}`])),
    });
}

export default function MutesListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
