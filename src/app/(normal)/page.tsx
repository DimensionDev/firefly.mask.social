'use client';

import { HomePage } from '@/app/(normal)/pages/Home.js';
import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import type { SearchParams } from '@/types/index.js';

export default function Page({ searchParams }: { searchParams: SearchParams }) {
    const source = searchParams.source
        ? resolveSocialPlatform(searchParams.source as SourceInURL)
        : SocialPlatform.Farcaster;
    return <HomePage source={source} />;
}
