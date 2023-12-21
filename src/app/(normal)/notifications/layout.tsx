import { t } from '@lingui/macro';
import type React from 'react';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

const title = t`Notifications`;

export const metadata = createSiteMetadata({
    title: createPageTitle(title),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
