import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { memo, useCallback } from 'react';
import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import Trash from '@/assets/trash2.svg';
import { SchedulePostSettings } from '@/components/Compose/SchedulePostSettings.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Tooltip } from '@/components/Tooltip.js';
import { VirtualList } from '@/components/VirtualList/VirtualList.js';
import { VirtualListFooter } from '@/components/VirtualList/VirtualListFooter.js';
import { queryClient } from '@/configs/queryClient.js';
import { ScrollListKey } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ConfirmModalRef, DraggablePopoverRef, SchedulePostModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { SchedulePostDisplayInfo, ScheduleTask } from '@/providers/types/Firefly.js';

function getTitle(displayInfo: SchedulePostDisplayInfo) {
    if (!displayInfo) return;
    switch (displayInfo.type) {
        case 'compose':
            return <Trans>POST</Trans>;
        case 'reply':
            return <Trans>REPLY</Trans>;
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
    const isMedium = useIsMedium();
    const content = displayInfo.content;

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
                enableCancelButton: true,
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
                    if (isMedium) {
                        SchedulePostModalRef.open({
                            action: 'update',
                            task,
                        });
                    } else {
                        DraggablePopoverRef.open({
                            content: (
                                <SchedulePostSettings
                                    action="update"
                                    task={task}
                                    onClose={() => DraggablePopoverRef.close()}
                                />
                            ),
                            enableOverflow: false,
                        });
                    }
                }}
            >
                <div className="line-clamp-5 min-h-[24px] break-words text-left text-[15px] leading-[24px]">
                    {content}
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
                            Saved on {dayjs(task.created_at).format('ddd, MMM DD, YYYY')} at{' '}
                            {dayjs(task.created_at).format('hh:mm A')}
                        </Trans>
                    ) : (
                        <Trans>
                            will send on {dayjs(task.publish_timestamp).format('ddd, MMM DD, YYYY')} at{' '}
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
