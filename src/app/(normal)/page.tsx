'use client';

import { HomePage } from '@/app/(normal)/pages/Home.js';
import { type SocialSourceInURL, Source } from '@/constants/enum.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import type { SearchParams } from '@/types/index.js';

export default function Page({ searchParams }: { searchParams: SearchParams }) {
    const source = searchParams.source
        ? resolveSocialSource(searchParams.source as SocialSourceInURL)
        : Source.Farcaster;
    return <HomePage source={source} />;
}
