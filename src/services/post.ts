import { t } from '@lingui/macro';
import dayjs from 'dayjs';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';

import { createIndicator, createNextIndicator, createPageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { type Response, type SchedulePostPayload, type ScheduleTasksResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import type { ComposeType } from '@/types/compose.js';

export async function schedulePost(
    scheduleTime: Date,
    posts: SchedulePostPayload[],
    displayInfo: { content: string; type: ComposeType },
) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v2/post/schedule');

    const response = await fireflySessionHolder.fetch<Response<{ taskId: string }>>(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                scheduleTime: dayjs(scheduleTime).toISOString(),
                posts,
                display_info: JSON.stringify(displayInfo),
                ua_type: 'web',
                groupId: uuid(),
            }),
        },
        true,
    );
    if (response.data?.taskId) return response.data.taskId;
    throw new Error(t`Failed to create scheduled post.`);
}

export async function updateScheduledPost(id: string, scheduleTime: Date) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/updateTasks');
    const response = await fireflySessionHolder.fetch<Response<string>>(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                taskUUID: id,
                publishTime: dayjs(scheduleTime).toISOString(),
                ua_type: 'web',
            }),
        },
        true,
    );
    if (response.data) return response.data;
    throw new Error(t`Failed to update scheduled post.`);
}

export async function deleteScheduledPost(id: string) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/deleteTask');
    const response = await fireflySessionHolder.fetch<Response<string>>(
        url,
        {
            method: 'POST',
            body: JSON.stringify({
                taskUUID: id,
            }),
        },
        true,
    );
    if (response.data) return true;
    throw new Error(t`Failed to delete scheduled post.`);
}

export async function getScheduledPosts(indicator?: PageIndicator) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/tasks');
    const response = await fireflySessionHolder.fetch<ScheduleTasksResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            cursor: indicator?.id,
            size: 20,
        }),
    });

    const data = resolveFireflyResponseData(response);

    return createPageable(
        data.tasks,
        createIndicator(indicator),
        data.cursor ? createNextIndicator(indicator, data.cursor) : undefined,
    );
}
