'use client';

import { t, Trans } from '@lingui/macro';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation.js';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import ComeBack from '@/assets/comeback.svg';
import { CommentList } from '@/components/Comments/index.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST, SITE_NAME } from '@/constants/index.js';
import { dynamic } from '@/esm/dynamic.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { useUpdateCurrentVisitingPost } from '@/hooks/useCurrentVisitingPost.js';
import { getPostById } from '@/services/getPostById.js';
import { getThreadById } from '@/services/getThreadById.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

const PostActions = dynamic(() => import('@/components/Actions/index.js').then((module) => module.PostActions), {
    ssr: false,
});

interface PageProps {
    params: {
        id: string;
        source: SourceInURL;
    };
}

export default function Page({ params: { id: postId, source } }: PageProps) {
    const [showMore, setShowMore] = useState(false);
    const router = useRouter();
    const currentSource = resolveSocialPlatform(source);

    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data: post = null } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', postId],
        queryFn: async () => {
            if (!postId) return;

            const post = await getPostById(currentSource, postId);
            if (!post) return;

            if (currentSource === SocialPlatform.Lens) fetchAndStoreViews([post.postId]);
            return post;
        },
    });

    const { data: threadsData = [] } = useSuspenseQuery({
        queryKey: [currentSource, 'thread-detail', post?.postId, post?.root?.postId],
        queryFn: async () => {
            const root = post?.root ? post.root : post;
            if (!root) return EMPTY_LIST;
            const thread = await getThreadById(currentSource, root);

            return [root, ...thread];
        },
    });

    const threads = useMemo(() => (showMore ? threadsData : threadsData.slice(0, 3)), [showMore, threadsData]);

    useDocumentTitle(post ? createPageTitle(t`Post by ${post?.author.displayName}`) : SITE_NAME);
    useUpdateCurrentVisitingPost(post);

    if (!post) return;

    return (
        <div className="min-h-screen">
            <div className="sticky top-0 z-40 flex items-center bg-primaryBottom px-4 py-[18px]">
                <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={() => router.back()} />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </div>
            <div>
                {threads.length >= 3 ? (
                    <>
                        <div className="border-b border-line px-4 py-3">
                            {threads.map((post, index) => (
                                <ThreadBody
                                    post={post}
                                    disableAnimate
                                    key={post.postId}
                                    isLast={index === threads.length - 1}
                                />
                            ))}
                            {threads.length === 3 && !showMore ? (
                                <div className="w-full cursor-pointer text-center text-[15px] font-bold text-link">
                                    <div onClick={() => setShowMore(true)}>
                                        <Trans>Show More</Trans>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <CommentList
                            postId={post.postId}
                            source={currentSource}
                            exclude={threadsData.map((x) => x.postId)}
                        />
                    </>
                ) : (
                    <>
                        <SinglePost post={post} disableAnimate isDetail />
                        <PostActions
                            disablePadding
                            post={post}
                            disabled={post?.isHidden}
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
