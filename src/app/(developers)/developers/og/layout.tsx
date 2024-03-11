import { t } from '@lingui/macro';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitle(t`OpenGraph`),
    });
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
