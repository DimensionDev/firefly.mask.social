import { t } from '@lingui/macro';

import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Mutes`),
    });
}

export default function MutesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
