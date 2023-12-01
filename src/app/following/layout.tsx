import type React from 'react';

import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createPageTitle } from '@/helpers/createSiteTitle.js';

export const metadata = createSiteMetadata({
    title: createPageTitle('Following'),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
