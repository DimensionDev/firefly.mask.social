import { t } from '@lingui/macro';
import { RedirectType } from 'next/dist/client/components/redirect.js';
import { redirect } from 'next/navigation.js';

import { Source } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveFollowingUrl } from '@/helpers/resolveFollowingUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Following`),
    });
}

export default function Following() {
    return redirect(resolveFollowingUrl(Source.Farcaster), RedirectType.replace);
}
