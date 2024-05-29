

import { t } from '@lingui/macro';

import { MuteMenuId } from '@/constants/enum.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { transSSR } from '@/helpers/transSSR.js';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params: { id } }: PageProps) {
    const menuNameMap: Record<string, string> = {
        [MuteMenuId.FarcasterUsers]: t`Farcaster Users`,
        [MuteMenuId.FarcasterChannels]: t`Farcaster Channels`,
        [MuteMenuId.LensUsers]: t`Lens Users`,
        [MuteMenuId.XUsers]: t`X Users`,
    }
    return createSiteMetadata({
        title: createPageTitle(transSSR(menuNameMap[id]))
    });
}

export default function MutesListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
