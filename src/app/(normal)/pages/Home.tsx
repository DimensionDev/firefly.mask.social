'use client';

import { t } from '@lingui/macro';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.jsx';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.jsx';
import { Source } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function HomePage() {
    const currentSource = useGlobalState.use.currentSource();

    useNavigatorTitle(t`Discover`);

    if (currentSource === Source.Article) {
        return <DiscoverArticleList />;
    }

    return <DiscoverPostList />;
}
