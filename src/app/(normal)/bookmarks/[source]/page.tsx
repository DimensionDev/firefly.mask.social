import { Suspense } from 'react';

import { ArticleBookmarkList } from '@/app/(normal)/bookmarks/ArticleBookmarkList.js';
import { BookmarkList } from '@/app/(normal)/bookmarks/BookmarkList.js';
import { Loading } from '@/components/Loading.js';
import { type BookmarkSource, Source, SourceInURL } from '@/constants/enum.js';
import { resolveSource } from '@/helpers/resolveSource.js';

export default function Page({ params }: { params: { source: SourceInURL } }) {
    const source = resolveSource(params.source) as BookmarkSource;

    return (
        <Suspense fallback={<Loading />}>
            {source === Source.Article ? <ArticleBookmarkList /> : <BookmarkList source={source} />}
        </Suspense>
    );
}
