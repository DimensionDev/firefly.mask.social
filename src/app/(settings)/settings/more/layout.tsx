import { t } from '@lingui/macro';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { transSSR } from '@/helpers/transSSR.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitle(transSSR(t`More`)),
    });
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
