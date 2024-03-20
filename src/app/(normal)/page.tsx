import { createIndicator } from '@masknet/shared-base';
import { unstable_cache } from 'next/cache.js';

import { discoverPosts } from '@/app/(normal)/helpers/discoverPosts.js';
import { Home } from '@/app/(normal)/pages/Home.js';
import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import type { SearchParams } from '@/types/index.js';

const fetchPosts = unstable_cache(discoverPosts, ['discoverPosts'], {
    revalidate: 60 * 3,
});

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
    try {
        const source = searchParams.source
            ? resolveSocialPlatform(searchParams.source as SourceInURL)
            : SocialPlatform.Farcaster;
        const posts = await fetchPosts(source, createIndicator(undefined, ''));

        return <Home source={source} pageable={posts} />;
    } catch {
        return <Home source={SocialPlatform.Farcaster} />;
    }
}
