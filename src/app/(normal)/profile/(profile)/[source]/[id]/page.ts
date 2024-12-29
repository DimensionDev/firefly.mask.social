import { notFound, redirect, RedirectType } from 'next/navigation.js';

import { SourceInURL } from '@/constants/enum.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export default async function Page(props: {
    params: Promise<{
        id: string;
        source: SourceInURL;
    }>;
}) {
    const params = await props.params;
    const id = params.id;
    const source = resolveSourceFromUrlNoFallback(params.source);
    if (!source || !isProfilePageSource(source)) notFound();
    redirect(resolveProfileUrl(source, id), RedirectType.replace);
}
