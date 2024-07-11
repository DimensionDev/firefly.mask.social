import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { compact, first, uniq } from 'lodash-es';
import { memo, useCallback } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import Trash from '@/assets/trash2.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { queryClient } from '@/configs/queryClient.js';
import { ScrollListKey } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { readChars } from '@/helpers/chars.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { ConfirmModalRef, SchedulePostModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { SchedulePostDisplayInfo, ScheduleTask } from '@/providers/types/Firefly.js';

function getTitle(displayInfo: SchedulePostDisplayInfo) {
    switch (displayInfo.type) {
        case 'compose':
            if (displayInfo.posts.length > 1) return <Trans>THREAD POST</Trans>;
            return <Trans>POST</Trans>;
        case 'reply':
            const target = first(displayInfo.posts);
            const parent = target?.parentPost;
            const post = parent?.Farcaster || parent?.Lens;
            const profileUrl = post ? getProfileUrl(post.author) : '';
            return (
                <Trans>
                    REPLY to
                    <span className="ml-1">
                        <Link href={profileUrl}>@{post?.author.handle}</Link>
                    </span>
                </Trans>
            );
        case 'quote':
            return <Trans>QUOTE</Trans>;
        default:
            safeUnreachable(displayInfo.type);
            return;
    }
}

const ScheduleTaskItem = memo(function ScheduleTaskItem({ task, index }: { task: ScheduleTask; index: number }) {
    const displayInfo = task.display_info;
    const title = getTitle(displayInfo);

    const post = first(displayInfo.posts);
    const content = post ? readChars(post.chars, 'visible') : '';

    const isFailed = task.status === 'fail';

    const [{ loading: removeLoading }, handleRemove] = useAsyncFn(async () => {
        try {
            if (!task.uuid) return;
            const confirmed = await ConfirmModalRef.openAndWaitForClose({
                title: t`Delete`,
                content: (
                    <div className="text-fourMain">
                        <Trans>This can’t be undone, and the scheduled send will be canceled.</Trans>
                    </div>
                ),
                confirmButtonText: t`Confirm`,
            });

            if (!confirmed) return;
            const result = await FireflySocialMediaProvider.deleteScheduledPost(task.uuid);
            if (!result) return;
            queryClient.refetchQueries({
                queryKey: ['schedule-tasks', fireflySessionHolder.session?.profileId],
            });
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to delete scheduled post.`), {
                error,
            });
            throw error;
        }
    }, [task.uuid]);

    return (
        <div className="border-b border-line py-3">
            <div className="flex items-center justify-between">
                <div
                    className={classNames('text-[12px] font-bold', {
                        'text-danger': isFailed,
                        'text-secondary': !isFailed,
                    })}
                >
                    {title}
                </div>
                {removeLoading ? (
                    <LoadingIcon className="h-5 w-5 animate-spin cursor-pointer text-secondary" />
                ) : (
                    <Tooltip content={t`Delete`}>
                        <Trash className="h-5 w-5 cursor-pointer text-secondary" onClick={handleRemove} />
                    </Tooltip>
                )}
            </div>
            <div
                className="my-2 cursor-pointer text-fourMain"
                onClick={() => {
                    SchedulePostModalRef.open({
                        action: 'update',
                        task,
                    });
                }}
            >
                <div className="line-clamp-5 min-h-[24px] break-words text-left text-[15px] leading-[24px]">
                    {content}
                </div>
                <div className="text-left">
                    {compact([
                        post?.images.length ? t`[Photo]` : undefined,
                        post?.video ? t`[Video]` : undefined,
                        post?.rpPayload ? t`[LuckyDrop]` : undefined,
                        post?.poll ? t`[Poll]` : undefined,
                    ]).join('')}
                </div>
            </div>
            <div className="flex gap-x-1">
                <span className="flex items-center gap-x-1 font-bold">
                    {uniq(task.platforms).map((platform, index) => (
                        <SocialSourceIcon key={index} source={resolveSocialSource(platform)} size={20} />
                    ))}
                </span>
                <span className="text-[13px] font-medium leading-[24px] text-secondary">
                    {isFailed ? (
                        <Trans>
                            Saved on {dayjs(task.created_at).format('DD MMM, YYYY')} at{' '}
                            {dayjs(task.created_at).format('hh:mm A')}
                        </Trans>
                    ) : (
                        <Trans>
                            The post will send on {dayjs(task.publish_timestamp).format('DD MMM, YYYY')} at{' '}
                            {dayjs(task.publish_timestamp).format('hh:mm A')}
                        </Trans>
                    )}
                </span>
            </div>
        </div>
    );
});
export function getScheduleTaskItemContent(index: number, task: ScheduleTask) {
    return <ScheduleTaskItem key={task.uuid} index={index} task={task} />;
}

export function ScheduleTaskList() {
    const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['schedule-tasks', fireflySessionHolder.session?.profileId],
        queryFn: async ({ pageParam }) => {
            return FireflySocialMediaProvider.getScheduledPosts(createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        refetchOnMount: true,
        select: (data) => data.pages.flatMap((x) => x.data),
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }
        await fetchNextPage();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

    if (!data?.length) {
        return <NoResultsFallback className="h-[478px] justify-center" />;
    }

    return (
        <div className="h-[478px]">
            <VirtualList
                data={data}
                endReached={onEndReached}
                components={{
                    Footer: VirtualListFooter,
                }}
                className={classNames('max-md:no-scrollbar schedule-task-list h-full')}
                listKey={`$${ScrollListKey.SchedulePosts}`}
                computeItemKey={(index, item) => item.uuid}
                itemContent={(index, task) => getScheduleTaskItemContent(index, task)}
            />
        </div>
    );
}
