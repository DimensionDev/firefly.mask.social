'use client';

import { safeUnreachable } from '@masknet/kit';
import { Suspense } from 'react';

import { ArticleBookmarkList } from '@/app/(normal)/bookmarks/ArticleBookmarkList.js';
import { BookmarkList } from '@/app/(normal)/bookmarks/BookmarkList.js';
import { NFTBookmarkList } from '@/app/(normal)/bookmarks/NFTBookmarkList.js';
import { Loading } from '@/components/Loading.js';
import { SnapshotBookmarkList } from '@/components/Snapshot/SnapshotBookmarkList.js';
import { type BookmarkSource, Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { useMounted } from '@/hooks/useMounted.js';

function BookmarkListContent({ source }: { source: BookmarkSource }) {
    switch (source) {
        case Source.DAOs:
            return <SnapshotBookmarkList />;
        case Source.Article:
            return <ArticleBookmarkList />;
        case Source.NFTs:
            return <NFTBookmarkList />;
        case Source.Farcaster:
        case Source.Lens:
            return <BookmarkList source={source} />;
        default:
            safeUnreachable(source);
            return null;
    }
}

export default function Page({ params }: { params: { source: SourceInURL } }) {
    const mounted = useMounted();
    const source = resolveSource(params.source) as BookmarkSource;

    if (!mounted) return null;

    return (
        <Suspense fallback={<Loading />}>
            <BookmarkListContent source={source} />
        </Suspense>
    );
}
