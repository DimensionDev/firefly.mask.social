import type React from 'react';

import { SITE_NAME } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata({
    title: `Search • ${SITE_NAME}`,
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen">{children}</div>;
}
