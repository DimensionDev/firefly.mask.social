'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { Suspense } from 'react';
import urlcat from 'urlcat';

import ComeBack from '@/assets/comeback.svg';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { ChannelInfo } from '@/components/Channel/ChannelInfo.js';
import { CommentList } from '@/components/Comments/index.js';
import { Loading } from '@/components/Loading.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { Section } from '@/components/Semantic/Section.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { NotFoundError } from '@/constants/error.js';
import { EMPTY_LIST, MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useUpdateCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

const PostActionsWithGrid = dynamic(
    () => import('@/components/Actions/index.js').then((module) => module.PostActionsWithGrid),
    {
        ssr: false,
    },
);

function refreshThreadByPostId(postId: string) {
    return fetch(
        urlcat('/api/thread', {
            id: postId,
        }),
        {
            method: 'PUT',
        },
    );
}

interface Props {
    id: string;
    source: SocialSource;
}

export function TwitterPostDetailPage({ id: postId, source }: Props) {
    const { data: post = null } = useSuspenseQuery({
        queryKey: [source, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            try {
                const provider = resolveSocialMediaProvider(source);
                const post = await provider.getPostById(postId);
                if (!post) return;

                if (source === Source.Lens) useImpressionsStore.getState().fetchAndStoreViews([post.postId]);
                return post;
            } catch (error) {
                if (error instanceof NotFoundError) return null;
                throw error;
            }
        },
    });

    if (!post) notFound();

    const { data: allPosts = EMPTY_LIST } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'thread-detail', post.postId, post.root?.postId],
        queryFn: async () => {
            const root = post.root ? post.root : post.commentOn ? post.commentOn : post;
            if (!root?.stats?.comments) return createPageable<Post>(EMPTY_LIST, createIndicator());

            if (!isSameProfile(root.author, post.author)) return createPageable<Post>(EMPTY_LIST, createIndicator());

            const provider = resolveSocialMediaProvider(source);
            const posts = await provider.getThreadByPostId(root.postId, isSamePost(root, post) ? post : undefined);

            if (!posts.some((x) => isSamePost(x, post))) return createPageable(EMPTY_LIST, undefined);

            return createPageable(posts, undefined);
        },
        initialPageParam: '',
        getNextPageParam: () => null,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    useUpdateCurrentVisitingPost(post);

    return (
        <article className="min-h-screen">
            <header className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </header>
            {post.channel ? (
                <Section title="Post Channel">
                    <ChannelInfo channel={post.channel} source={post.source} className="border-b border-line p-3" />
                </Section>
            ) : null}
            <>
                {allPosts.length >= MIN_POST_SIZE_PER_THREAD ? (
                    <>
                        <article className="px-4 py-3">
                            {allPosts.map((post, index) => (
                                <ThreadBody
                                    isDetail
                                    post={post}
                                    disableAnimate
                                    showTranslate
                                    key={post.postId}
                                    isLast={index === allPosts.length - 1}
                                />
                            ))}
                        </article>
                        <Section title="Post Comments">
                            <CommentList
                                postId={post.postId}
                                source={source}
                                excludePostIds={allPosts.map((x) => x.postId)}
                            />
                        </Section>
                    </>
                ) : (
                    <>
                        <SinglePost post={post} disableAnimate isDetail showTranslate className="border-b-0" />
                        <Section title="Post Statistics And Actions">
                            <PostStatistics post={post} className="mb-1.5 px-3" />
                            {!post.isHidden ? (
                                <PostActionsWithGrid
                                    disablePadding
                                    post={post}
                                    disabled={post.isHidden}
                                    className="!mt-0 border-b border-t border-line py-3 pl-2 pr-4"
                                />
                            ) : null}
                        </Section>
                        {/* TODO: Compose Comment Input */}
                        <Suspense fallback={<Loading />}>
                            <Section title="Post Comments">
                                <CommentList postId={postId} source={source} />
                            </Section>
                        </Suspense>
                    </>
                )}
            </>
        </article>
    );
}
