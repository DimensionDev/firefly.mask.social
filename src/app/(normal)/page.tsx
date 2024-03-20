import { createIndicator } from '@masknet/shared-base';

import { discoverPosts } from '@/app/(normal)/helpers/discoverPosts.js';
import { Home } from '@/app/(normal)/pages/Home.js';
import { SocialPlatform } from '@/constants/enum.js';

export default async function Page() {
    const posts = await discoverPosts(SocialPlatform.Farcaster, createIndicator(undefined, ''));

    return <Home pageable={posts} />;
}
