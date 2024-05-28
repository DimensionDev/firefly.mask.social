
import { find } from 'lodash-es';

import { createPageTitle } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getFullMuteMenuList } from '@/helpers/getFullMuteMenuList.js';
import { transSSR } from '@/helpers/transSSR.js';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params: { id } }: PageProps) {
    const pageTitle = find(getFullMuteMenuList(), menu => menu.id === id)?.name ?? '';
    return createSiteMetadata({
        title: createPageTitle(transSSR(pageTitle)),
    });
}

export default function MutesListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
