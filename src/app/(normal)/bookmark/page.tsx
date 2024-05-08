'use client';
import { Suspense } from 'react';

import { BookmarkList } from '@/app/(normal)/bookmark/BookmarkList.js';
import { Loading } from '@/components/Loading.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    return (
        <Suspense fallback={<Loading />}>
            <BookmarkList source={currentSocialSource} />
        </Suspense>
    );
}
