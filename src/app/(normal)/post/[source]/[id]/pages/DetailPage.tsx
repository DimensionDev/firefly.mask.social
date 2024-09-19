'use client';

import { Trans } from '@lingui/macro';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { last } from 'lodash-es';
import { Suspense, useEffect } from 'react';
import urlcat from 'urlcat';

import ComeBack from '@/assets/comeback.svg';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { Info } from '@/components/Channel/Info.js';
import { CommentList } from '@/components/Comments/index.js';
import { Loading } from '@/components/Loading.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST, MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { createIndicator, createPageable } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useUpdateCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
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
    post: Post;
    id: string;
    source: SocialSource;
}

export function PostDetailPage({ post, id: postId, source }: Props) {
    const comeback = useComeBack();

    useEffect(() => {
        if (source === Source.Lens) useImpressionsStore.getState().fetchAndStoreViews([post.postId]);
    }, [source, post.postId]);

    const { data: allPosts = EMPTY_LIST } = useSuspenseInfiniteQuery({
        queryKey: ['posts', source, 'thread-detail', post.postId, post.root?.postId],
        queryFn: async () => {
            const root = post.root ? post.root : post.commentOn ? post.commentOn : post;
            if (!root?.stats?.comments) return createPageable<Post>(EMPTY_LIST, createIndicator());

            if (!isSameProfile(root.author, post.author)) return createPageable<Post>(EMPTY_LIST, createIndicator());

            const provider = resolveSocialMediaProvider(source);
            const posts = await provider.getThreadByPostId(root.postId, isSamePost(root, post) ? post : undefined);

            /**
             * The data of Lens is stored in Redis.
             * Since there is no expiration time and we need to check each time whether a new post has been added to the thread.
             * If so, we need to clear the cache and request again.
             */
            if (source === Source.Lens && posts.length >= MIN_POST_SIZE_PER_THREAD) {
                const lastPost = last(posts);
                if (!lastPost) return createPageable(posts, undefined);

                const commentsOfLastPost = await LensSocialMediaProvider.getCommentsByProfileId(
                    lastPost.postId,
                    lastPost.author.profileId,
                );
                if (commentsOfLastPost.data.length === 0) return createPageable(posts, undefined);

                const response = await refreshThreadByPostId(root.postId);
                if (response.status !== 200) return createPageable(posts, undefined);
                return createPageable(await provider.getThreadByPostId(root.postId), undefined);
            }

            if (!posts.some((x) => isSamePost(x, post))) return createPageable(EMPTY_LIST, undefined);

            return createPageable(posts, undefined);
        },
        initialPageParam: '',
        getNextPageParam: () => null,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    useUpdateCurrentVisitingPost(post);

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </div>
            {post.channel ? (
                <Info channel={post.channel} source={post.source} className="border-b border-line p-3" />
            ) : null}
            <div>
                {allPosts.length >= MIN_POST_SIZE_PER_THREAD ? (
                    <>
                        <div className="px-4 py-3">
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
                        </div>
                        <CommentList
                            postId={post.postId}
                            source={source}
                            excludePostIds={allPosts.map((x) => x.postId)}
                        />
                    </>
                ) : (
                    <>
                        <SinglePost post={post} disableAnimate isDetail showTranslate className="border-b-0" />
                        <PostStatistics post={post} className="mb-1.5 px-3" />
                        {!post.isHidden ? (
                            <PostActionsWithGrid
                                disablePadding
                                post={post}
                                disabled={post.isHidden}
                                className="!mt-0 border-b border-t border-line py-3 pl-2 pr-4"
                            />
                        ) : null}
                        {/* TODO: Compose Comment Input */}
                        <Suspense fallback={<Loading />}>
                            <CommentList postId={postId} source={source} />
                        </Suspense>
                    </>
                )}
            </div>
        </div>
    );
}
