'use client';

import { t } from '@lingui/macro';
import { useEffect } from 'react';

import { DiscoverArticleList } from '@/components/Article/DiscoverArticleList.js';
import { DiscoverPostList } from '@/components/Posts/DiscoverPostList.js';
import { Source } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function HomePage() {
    const currentSource = useGlobalState.use.currentSource();

    useEffect(() => {
        LensSocialMediaProvider.getHiddenComments('0x01de9d-0x014a')
            .then((r) => {
                console.log(r);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useNavigatorTitle(t`Discover`);

    if (currentSource === Source.Article) {
        return <DiscoverArticleList />;
    }

    return <DiscoverPostList />;
}
