import { t } from '@lingui/macro';
import { RedirectType } from 'next/dist/client/components/redirect.js';
import { redirect } from 'next/navigation.js';

import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: await createPageTitleSSR(t`Following`),
    });
}

export default function Following() {
    redirect(resolveFollowingUrl(DEFAULT_SOCIAL_SOURCE), RedirectType.replace);
}
