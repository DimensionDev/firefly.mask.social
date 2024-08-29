import { t } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { first } from 'lodash-es';

import type { SocialSourceInURL } from '@/constants/enum.js';
import { CreateScheduleError, SignlessRequireError } from '@/constants/error.js';
import { checkScheduleTime } from '@/helpers/checkScheduleTime.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileSessionsAll } from '@/helpers/getProfileState.js';
import { getScheduleTaskContent } from '@/helpers/getScheduleTaskContent.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { SchedulePayload } from '@/helpers/resolveCreateSchedulePostPayload.js';
import { EnableSignlessModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { createSchedulePostsPayload } from '@/services/crossSchedulePost.js';
import { uploadSessions } from '@/services/metrics.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

export async function crossPostScheduleThread(scheduleTime: Date) {
    try {
        const { posts, type } = useComposeStateStore.getState();
        if (posts.length === 1) throw new Error(t`A thread must have at least two posts.`);

        checkScheduleTime(scheduleTime);

        const results = new Map<
            SocialSourceInURL,
            { platform: SocialSourceInURL; platformUserId: string; payload: SchedulePayload[] }
        >();

        for (const [index, post] of posts.entries()) {
            const payload = await createSchedulePostsPayload(index === 0 ? 'compose' : 'reply', post, true);
            payload.forEach((x) => {
                const origin = results.get(x.platform);
                results.set(x.platform, {
                    ...x,
                    payload: origin ? [...origin.payload, x.payload] : [x.payload],
                });
            });
            await delay(1000);
        }

        const postsPayload = [...results.values()];

        const post = first(posts);
        const content = getScheduleTaskContent(post);

        await useLensStateStore.getState().refreshCurrentAccount();
        await uploadSessions('merge', fireflySessionHolder.sessionRequired, getProfileSessionsAll());

        const result = await FireflySocialMediaProvider.schedulePost(
            scheduleTime,
            postsPayload.map((x) => ({
                ...x,
                payload: JSON.stringify(x.payload),
            })),
            {
                content,
                type,
            },
        );

        if (!result) return;
        enqueueSuccessMessage(t`Your schedule thread has created successfully.`);
    } catch (error) {
        if (error instanceof CreateScheduleError) {
            enqueueErrorMessage(error.message, {
                description: error.description,
            });
        } else if (error instanceof SignlessRequireError) {
            EnableSignlessModalRef.open();
        } else {
            const errorWithName = error as { name: string };
            const errorName = errorWithName.name;
            if (errorName === 'ConnectorNotConnectedError') throw error;
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to create schedule thread posts.`), {
                error,
            });
        }
        throw error;
    }
}
