import type React from 'react';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata({
    title: createPageTitle('Profile'),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
