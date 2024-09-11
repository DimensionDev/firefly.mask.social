import { notFound, redirect } from 'next/navigation.js';

import { type SocialSource, SourceInURL } from '@/constants/enum.js';
import { isSocialSourceInURL } from '@/helpers/isSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';

interface Props {
    params: { source: string };
    searchParams: { source: SourceInURL };
}

export default function Page({ params, searchParams }: Props) {
    if (!isSocialSourceInURL(params.source as SourceInURL) && params.source !== SourceInURL.Wallet) {
        const source = resolveSourceFromUrl(searchParams.source ?? '') as SocialSource;
        return redirect(resolveProfileUrl(source, params.source));
    }
    return notFound();
}
