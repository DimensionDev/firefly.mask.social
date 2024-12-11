'use client';

import { useQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { memo, useEffect, useMemo } from 'react';

import { ArticleBody } from '@/components/Article/ArticleBody.js';
import { ActionContainer } from '@/components/Blink/ActionContainer.js';
import { FrameLayout } from '@/components/Frame/index.js';
import { CollectionPreviewer, NFTPreviewer } from '@/components/NFTs/NFTPreview.js';
import { OembedLayout } from '@/components/Oembed/index.js';
import { Player } from '@/components/Oembed/Player.js';
import { TweetSpace } from '@/components/Posts/TweetSpace.js';
import { SnapshotBody } from '@/components/Snapshot/SnapshotBody.js';
import { type SocialSource } from '@/constants/enum.js';
import { LINK_MARK_RE } from '@/constants/linkRegExp.js';
import type { Chars } from '@/helpers/chars.js';
import { readChars } from '@/helpers/chars.js';
import { createDummyPost } from '@/helpers/createDummyPost.js';
import { getArticleUrl } from '@/helpers/getArticleUrl.js';
import { isLinkMatchingHost } from '@/helpers/isLinkMatchingHost.js';
import { removeAtEnd } from '@/helpers/removeAtEnd.js';
import { resolveOembedUrl } from '@/helpers/resolveOembedUrl.js';
import { FireflyArticleProvider } from '@/providers/firefly/Article.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPostLinks } from '@/services/getPostLinks.js';
import type { ComposeType } from '@/types/compose.js';

interface Props {
    post: Post;
    setContent?: (content: string) => void;
    isInCompose?: boolean;
}

export const PostLinks = memo(function PostLinks({ post, setContent, isInCompose = false }: Props) {
    const router = useRouter();
    const url = resolveOembedUrl(post);
    const { isLoading, error, data } = useQuery({
        queryKey: ['post-embed', url, post.postId],
        queryFn: () => getPostLinks(url!, post),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        enabled: !!url,
    });

    const { data: article } = useQuery({
        enabled: !!data?.articleId,
        queryKey: ['article-detail', data?.articleId],
        queryFn: async () => {
            if (!data?.articleId) return;
            return FireflyArticleProvider.getArticleById(data.articleId);
        },
    });

    useEffect(() => {
        const content = post.metadata.content?.content;
        if (data && url && content) {
            setContent?.(removeAtEnd(content, url));
        }
    }, [data, setContent, post, url]);

    if (!url || isLoading || error || !data) return null;

    return (
        <>
            {article ? (
                <ArticleBody
                    article={article}
                    onClick={() => {
                        if (!article || article.author.isMuted) return;

                        const selection = window.getSelection();
                        if (selection && selection.toString().length !== 0) return;

                        if (isInCompose) return;

                        router.push(getArticleUrl(article));
                        return;
                    }}
                />
            ) : null}
            {data.snapshot && !isInCompose ? (
                <SnapshotBody snapshot={data.snapshot} link={url} postId={post.postId} />
            ) : null}
            {data.html ? (
                <Player html={data.html} isSpotify={isLinkMatchingHost(url, 'open.spotify.com', false)} />
            ) : null}
            {data.frame ? <FrameLayout frame={data.frame} post={post} /> : null}
            {data.action ? <ActionContainer action={data.action} url={url} /> : null}
            {data.oembed ? <OembedLayout data={data.oembed} post={post} /> : null}
            {data.spaceId ? <TweetSpace spaceId={data.spaceId} /> : null}
            {data.nft ? <NFTPreviewer nft={data.nft} /> : null}
            {data.collection ? <CollectionPreviewer collection={data.collection} /> : null}
        </>
    );
});

export function PostLinksInCompose({
    type,
    chars,
    source,
    parentPost,
}: {
    chars: Chars;
    source: SocialSource;
    type: ComposeType;
    parentPost?: Post | null;
}) {
    const post = useMemo(() => {
        const content = readChars(chars, 'visible');
        const oembedUrls = content.match(LINK_MARK_RE) || [];
        const oembedUrl = last(oembedUrls);

        return {
            ...createDummyPost(source, content, oembedUrl, oembedUrls),
            quoteOn: type === 'quote' ? (parentPost ?? undefined) : undefined,
        } satisfies Post;
    }, [chars, parentPost, source, type]);

    return <PostLinks post={post} isInCompose />;
}
