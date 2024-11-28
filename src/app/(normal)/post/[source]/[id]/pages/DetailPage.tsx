import { Trans } from '@lingui/macro';
import { notFound } from 'next/navigation.js';
import { Suspense } from 'react';

import { PostActionsWithGrid } from '@/components/Actions/index.js';
import { PostStatistics } from '@/components/Actions/PostStatistics.js';
import { ChannelInfo } from '@/components/Channel/ChannelInfo.js';
import { Comeback } from '@/components/Comeback.js';
import { CommentList } from '@/components/Comments/index.js';
import { Loading } from '@/components/Loading.js';
import { NoSSR } from '@/components/NoSSR.js';
import { PostDetailEffect } from '@/components/PostDetailEffect.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ThreadBody } from '@/components/Posts/ThreadBody.js';
import { Section } from '@/components/Semantic/Section.js';
import { type SocialSource } from '@/constants/enum.js';
import { MIN_POST_SIZE_PER_THREAD } from '@/constants/index.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getThreads } from '@/services/getThreads.js';

interface Props {
    id: string;
    source: SocialSource;
}

export async function PostDetailPage({ id: postId, source }: Props) {
    if (!postId) notFound();

    const provider = resolveSocialMediaProvider(source);
    const post = await runInSafeAsync(() => provider.getPostById(postId));

    if (!post) notFound();

    const threads = await getThreads(post, source);
    const allPosts = threads.data;

    return (
        <article className="min-h-screen">
            <header className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
                <Comeback className="mr-8" />
                <h2 className="text-xl font-black leading-6">
                    <Trans>Details</Trans>
                </h2>
            </header>
            {post.channel ? (
                <Section title="Post Channel">
                    <ChannelInfo channel={post.channel} source={post.source} className="border-b border-line p-3" />
                </Section>
            ) : null}
            {allPosts.length >= MIN_POST_SIZE_PER_THREAD ? (
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
            ) : (
                <>
                    <SinglePost post={post} className="border-b-0" disableAnimate isDetail showTranslate />

                    <Section title="Post Statistics And Actions">
                        <NoSSR>
                            <PostStatistics post={post} className="mb-1.5 px-3" />
                            {!post.isHidden ? (
                                <PostActionsWithGrid
                                    disablePadding
                                    post={post}
                                    isDetail
                                    disabled={post.isHidden}
                                    className="!mt-0 border-b border-t border-line py-3 pl-2 pr-4"
                                />
                            ) : null}
                        </NoSSR>
                    </Section>
                </>
            )}
            <Suspense fallback={<Loading />}>
                <Section title="Post Comments">
                    <NoSSR>
                        <CommentList
                            postId={postId}
                            source={source}
                            excludePostIds={
                                allPosts.length >= MIN_POST_SIZE_PER_THREAD ? allPosts.map((x) => x.postId) : []
                            }
                        />
                    </NoSSR>
                </Section>
            </Suspense>
            <PostDetailEffect post={post} />
        </article>
    );
}
