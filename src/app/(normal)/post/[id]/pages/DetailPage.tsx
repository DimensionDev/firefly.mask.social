'use client';

import { t, Trans } from '@lingui/macro';
import { createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { notFound } from 'next/navigation.js';
import type React from 'react';
import urlcat from 'urlcat';
import { useDocumentTitle } from 'usehooks-ts';

import ComeBack from '@/assets/comeback.svg';
import { CommentList } from '@/components/Comments/index.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { type SocialSourceInURL, Source } from '@/constants/enum.js';
import { MIN_POST_SIZE_PER_THREAD, SITE_NAME } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useUpdateCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        source: SocialSourceInURL;
    };
}

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

export function PostDetailPage({ params: { id: postId }, searchParams: { source } }: PageProps) {
    const currentSource = resolveSocialSource(source);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const comeback = useComeBack();

    const { data: post = null } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            try {
                const provider = resolveSocialMediaProvider(currentSource);
                const post = await provider.getPostById(postId);
                if (!post) return;

                if (currentSource === Source.Lens) fetchAndStoreViews([post.postId]);
                return post;
            } catch (err) {
                if (err instanceof Error && err.message === 'Post not found') return null;
                throw err;
            }
        },
    });

    if (!post) {
        notFound();
    }

    const { data: allPosts = EMPTY_LIST } = useSuspenseInfiniteQuery({
        queryKey: ['posts', currentSource, 'thread-detail', post.postId, post.root?.postId],
        queryFn: async () => {
            const root = post.root ? post.root : post.commentOn ? post.commentOn : post;
            if (!root?.stats?.comments) return createPageable(EMPTY_LIST, undefined);

            if (!isSameProfile(root.author, post.author)) return createPageable(EMPTY_LIST, undefined);

            const provider = resolveSocialMediaProvider(currentSource);
            const posts = await provider.getThreadByPostId(root.postId, root.postId === post.postId ? post : undefined);

            /**
             * The data of Lens is stored in Redis.
             * Since there is no expiration time and we need to check each time whether a new post has been added to the thread.
             * If so, we need to clear the cache and request again.
             */
            if (currentSource === Source.Lens && posts.length >= MIN_POST_SIZE_PER_THREAD) {
                const lastPost = last(posts);
                if (!lastPost) return createPageable(posts, undefined);

                const commentsOfLastPost = await LensSocialMediaProvider.getCommentsByUserId(
                    lastPost.postId,
                    lastPost.author.profileId,
                );
                if (commentsOfLastPost.data.length === 0) return createPageable(posts, undefined);

                const response = await refreshThreadByPostId(root.postId);
                if (response.status !== 200) return createPageable(posts, undefined);
                return createPageable(await provider.getThreadByPostId(root.postId), undefined);
            }

            if (!posts.some((x) => x.postId === post.postId)) return createPageable(EMPTY_LIST, undefined);

            return createPageable(posts, undefined);
        },
        initialPageParam: '',
        getNextPageParam: () => null,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    useDocumentTitle(post?.author ? createPageTitle(t`Post by ${post.author.displayName}`) : SITE_NAME);
    useUpdateCurrentVisitingPost(post);

    if (!post) return;

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </div>
            <div>
                {allPosts.length >= MIN_POST_SIZE_PER_THREAD ? (
                    <>
                        <div className="border-b border-line px-4 py-3">
                            {allPosts.map((post, index) => (
                                <ThreadBody
                                    post={post}
                                    disableAnimate
                                    key={post.postId}
                                    isLast={index === allPosts.length - 1}
                                />
                            ))}
                        </div>
                        <CommentList
                            postId={post.postId}
                            source={currentSource}
                            exclude={allPosts.map((x) => x.postId)}
                        />
                    </>
                ) : (
                    <>
                        <SinglePost post={post} disableAnimate isDetail />
                        <PostActions
                            disablePadding
                            post={post}
                            disabled={post.isHidden}
                            className="!mt-0 border-b border-line px-4 py-3"
                        />
                        {/* TODO: Compose Comment Input */}
                        <CommentList postId={postId} source={currentSource} />
                    </>
                )}
            </div>
        </div>
    );
}
