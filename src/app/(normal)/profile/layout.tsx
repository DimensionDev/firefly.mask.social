import { t } from '@lingui/macro';
import { headers } from 'next/headers.js';
import type React from 'react';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata({
    title: createPageTitle(t`Profile`),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    const isBotRequest = headers().get('X-IS-BOT') === 'true';

    if (isBotRequest) return null;

    return <>{children}</>;
}
