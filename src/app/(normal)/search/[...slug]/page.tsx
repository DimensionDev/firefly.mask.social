'use client';

import { safeUnreachable } from '@masknet/kit';

import { SearchChannelContent } from '@/app/(normal)/search/[...slug]/pages/SearchChannelContent.js';
import { SearchNFTContent } from '@/app/(normal)/search/[...slug]/pages/SearchNFTContent.js';
import { SearchPostContent } from '@/app/(normal)/search/[...slug]/pages/SearchPostContent.js';
import { SearchProfileContent } from '@/app/(normal)/search/[...slug]/pages/SearchProfileContent.js';
import { SearchTokenContent } from '@/app/(normal)/search/[...slug]/pages/SearchTokenContent.js';
import { SearchType } from '@/constants/enum.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

export default function Page() {
    const { searchType } = useSearchStateStore();

    switch (searchType) {
        case SearchType.Profiles:
            return <SearchProfileContent />;
        case SearchType.Posts:
            return <SearchPostContent />;
        case SearchType.Channels:
            return <SearchChannelContent />;
        case SearchType.Tokens:
            return <SearchTokenContent />;
        case SearchType.NFTs:
            return <SearchNFTContent />;
        default:
            safeUnreachable(searchType);
            return null;
    }
}
