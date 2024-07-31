import { t } from '@lingui/macro';

import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Associated wallets`),
    });
}

export default function WalletsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
