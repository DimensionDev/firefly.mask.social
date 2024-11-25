import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { uniq } from 'lodash-es';
import { memo, useCallback } from 'react';
import { useAsyncFn } from 'react-use';

import Close from '@/assets/close.svg';
import Info from '@/assets/info.svg';
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
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { ConfirmModalRef, DraggablePopoverRef, SchedulePostModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { captureComposeSchedulePostEvent } from '@/providers/telemetry/captureComposeEvent.js';
import type { SchedulePostDisplayInfo, ScheduleTask } from '@/providers/types/Firefly.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { deleteScheduledPost, getScheduledPosts } from '@/services/post.js';
import { usePreferencesState } from '@/store/usePreferenceStore.js';

function getTitle(displayInfo: SchedulePostDisplayInfo, isFailed: boolean) {
    if (!displayInfo) return;
    switch (displayInfo.type) {
        case 'compose':
            return isFailed ? <Trans>FAILED POST</Trans> : <Trans>POST</Trans>;
        case 'reply':
            return <Trans>REPLY</Trans>;
        case 'quote':
            return <Trans>QUOTE</Trans>;
        default:
            safeUnreachable(displayInfo.type);
            return;
    }
}

const ScheduleTaskItem = memo(function ScheduleTaskItem({ task }: { task: ScheduleTask }) {
    const displayInfo = task.display_info;
    const isFailed = task.status === 'fail';

    const title = getTitle(displayInfo, isFailed);
    const isMedium = useIsMedium();
    const content = displayInfo.content;

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

            const result = await deleteScheduledPost(task.uuid);
            if (!result) return;

            queryClient.refetchQueries({
                queryKey: ['schedule-tasks', fireflySessionHolder.session?.profileId],
            });

            captureComposeSchedulePostEvent(EventId.COMPOSE_SCHEDULED_POST_DELETE_SUCCESS, null, {
                scheduleId: task.uuid,
            });
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to delete scheduled post.`), {
                error,
            });
            throw error;
        }
    }, [task.uuid]);

    return (
        <div className="border-b border-line p-3">
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
                <div className="line-clamp-5 min-h-[24px] break-words text-left text-medium leading-[24px]">
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

function getScheduleTaskItemContent(task: ScheduleTask) {
    return <ScheduleTaskItem key={task.uuid} task={task} />;
}

export function ScheduleTaskList() {
    const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['schedule-tasks', fireflySessionHolder.session?.profileId],
        queryFn: async ({ pageParam }) => {
            return getScheduledPosts(createIndicator(undefined, pageParam));
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

    const { preferences, setPreference } = usePreferencesState();

    if (!data?.length) {
        return <NoResultsFallback className="h-[478px] justify-center" />;
    }

    return (
        <div className="no-scrollbar box-border flex flex-grow flex-col gap-1 overflow-auto p-3">
            {preferences.SHOW_SCHEDULE_POST_TIP ? (
                <div className="flex items-center gap-1.5 rounded-[4px] bg-bg p-3">
                    <Info width={20} height={20} className="shrink-0 text-main" />
                    <div className="text-left text-xs leading-4 text-main">
                        <Trans>
                            Logging out will cause scheduled posts to fail. To ensure that posts are sent as scheduled,
                            please make sure that your Firefly account remains logged in.
                        </Trans>
                    </div>
                    <Close
                        width={20}
                        height={20}
                        className="shrink-0 cursor-pointer text-main"
                        onClick={() => {
                            setPreference('SHOW_SCHEDULE_POST_TIP', false);
                        }}
                    />
                </div>
            ) : null}
            <VirtualList
                data={data}
                endReached={onEndReached}
                components={{
                    Footer: VirtualListFooter,
                }}
                className="no-scrollbar schedule-task-list box-border h-full min-h-0"
                listKey={`$${ScrollListKey.SchedulePosts}`}
                computeItemKey={(index, item) => item.uuid}
                itemContent={(index, task) => getScheduleTaskItemContent(task)}
            />
        </div>
    );
}
