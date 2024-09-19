import { t } from '@lingui/macro';
import { redirect } from 'next/navigation.js';

import { Source } from '@/constants/enum.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Profile`),
    });
}

export default function Page() {
    return redirect(resolveProfileUrl(Source.Farcaster));
}
