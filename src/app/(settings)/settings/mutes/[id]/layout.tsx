import { t } from '@lingui/macro';

import { MuteMenuId, Source } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { transSSR } from '@/helpers/transSSR.js';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params: { id } }: PageProps) {
    const menuNameMap: Record<string, string> = {
        [MuteMenuId.FarcasterProfiles]: t`${resolveSourceName(Source.Farcaster)} Users`,
        [MuteMenuId.FarcasterChannels]: t`${resolveSourceName(Source.Farcaster)} Channels`,
        [MuteMenuId.LensProfiles]: t`${resolveSourceName(Source.Lens)} Users`,
        [MuteMenuId.XProfiles]: t`${resolveSourceName(Source.Twitter)} Users`,
    };
    return createSiteMetadata({
        title: createPageTitle(transSSR(menuNameMap[id])),
    });
}

export default function MutesListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
