import type React from 'react';

import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata();

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
