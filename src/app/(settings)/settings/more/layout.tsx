import { SITE_NAME } from '@/constants/index.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export const metadata = createSiteMetadata({
    title: `More • ${SITE_NAME}`,
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
