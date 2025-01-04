import { t } from '@lingui/macro';
import { redirect, RedirectType } from 'next/navigation.js';

import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveBookmarkUrl } from '@/helpers/resolveBookmarkUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: await createPageTitleSSR(t`Bookmarks`),
    });
}

export default function Page() {
    redirect(resolveBookmarkUrl(DEFAULT_SOCIAL_SOURCE), RedirectType.replace);
}
