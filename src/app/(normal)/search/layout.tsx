import { t } from '@lingui/macro';
import type React from 'react';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitle(t`Search`),
    });
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen">{children}</div>;
}
