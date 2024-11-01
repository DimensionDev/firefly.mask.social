import { redirect, RedirectType } from 'next/navigation.js';

import { ShareLinkPage, type ShareLinkProps } from '@/app/(normal)/intent/compose/pages/ShareLinkPage.js';
import { DEFAULT_SOCIAL_SOURCE } from '@/constants/index.js';
import { resolveDiscoverUrl } from '@/helpers/resolveDiscoverUrl.js';
import { trimify } from '@/helpers/trimify.js';

interface Props {
    searchParams: ShareLinkProps;
}

export default function Page({ searchParams }: Props) {
    if (!trimify(searchParams.text || '')) {
        redirect(resolveDiscoverUrl(DEFAULT_SOCIAL_SOURCE), RedirectType.replace);
    }

    return <ShareLinkPage {...searchParams} />;
}
