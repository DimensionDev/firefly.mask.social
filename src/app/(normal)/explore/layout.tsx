import { t } from '@lingui/macro';
import type React from 'react';

import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Explore`), //TODO: i18n
    });
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
