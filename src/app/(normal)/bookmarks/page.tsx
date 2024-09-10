'use client';

import { Suspense } from 'react';

import { ArticleBookmarkList } from '@/app/(normal)/bookmarks/ArticleBookmarkList.js';
import { BookmarkList } from '@/app/(normal)/bookmarks/BookmarkList.js';
import { Loading } from '@/components/Loading.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();

    return (
        <Suspense fallback={<Loading />}>
            {currentSource === Source.Article ? (
                <ArticleBookmarkList />
            ) : (
                <BookmarkList source={currentSource as SocialSource} />
            )}
        </Suspense>
    );
}
