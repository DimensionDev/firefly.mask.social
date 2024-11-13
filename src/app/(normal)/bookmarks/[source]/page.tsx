'use client';

import { Suspense } from 'react';

import { ArticleBookmarkList } from '@/app/(normal)/bookmarks/ArticleBookmarkList.js';
import { BookmarkList } from '@/app/(normal)/bookmarks/BookmarkList.js';
import { Loading } from '@/components/Loading.js';
import { SnapshotBookmarkList } from '@/components/Snapshot/SnapshotBookmarkList.js';
import { type BookmarkSource, Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { useMounted } from '@/hooks/useMounted.js';

export default function Page({ params }: { params: { source: SourceInURL } }) {
    const mounted = useMounted();
    const source = resolveSource(params.source) as BookmarkSource;

    if (source === Source.DAOs) {
        return (
            <Suspense fallback={<Loading />}>
                <SnapshotBookmarkList />
            </Suspense>
        );
    }

    if (!mounted) return null;

    return (
        <Suspense fallback={<Loading />}>
            {source === Source.Article ? <ArticleBookmarkList /> : <BookmarkList source={source} />}
        </Suspense>
    );
}
