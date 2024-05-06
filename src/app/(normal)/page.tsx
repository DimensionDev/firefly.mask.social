'use client';

import { HomePage } from '@/app/(normal)/pages/Home.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import type { SearchParams } from '@/types/index.js';

export default function Page({ searchParams }: { searchParams: SearchParams }) {
    const source = searchParams.source ? resolveSource(searchParams.source as SourceInURL) : Source.Farcaster;
    return <HomePage source={source} />;
}
