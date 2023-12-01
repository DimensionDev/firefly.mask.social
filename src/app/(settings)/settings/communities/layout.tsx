import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { createPageTitle } from '@/helpers/createSiteTitle.js';

export const metadata = createSiteMetadata({
    title: createPageTitle('Communities'),
});

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
