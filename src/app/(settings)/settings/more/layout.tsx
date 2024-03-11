import { t } from '@lingui/macro';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getLocale } from '@/i18n/index.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitle(getLocale(getLocaleFromCookies(), t`More`)),
    });
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
