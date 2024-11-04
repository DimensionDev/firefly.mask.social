import { t } from '@lingui/macro';
import { type PropsWithChildren } from 'react';

import { SearchTabs } from '@/components/Search/SearchTabs.js';
import { createPageTitleSSR } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';

export async function generateMetadata() {
    return createSiteMetadata({
        title: createPageTitleSSR(t`Search`),
    });
}

export default function SearchLayout({ children }: PropsWithChildren) {
    return (
        <div>
            <SearchTabs />
            {children}
        </div>
    );
}
