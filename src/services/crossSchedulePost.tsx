import { t, Trans } from '@lingui/macro';
import { ConnectorNotConnectedError } from '@wagmi/core';
import dayjs from 'dayjs';
import urlcat from 'urlcat';

import { DraftPageTab } from '@/components/Compose/DraftPage.js';
import { CreateScheduleError, SignlessRequireError, UnauthorizedError } from '@/constants/error.js';
import { SUPPORTED_FRAME_SOURCES } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { checkScheduleTime } from '@/helpers/checkScheduleTime.js';
import { enqueueInfoMessage, enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getCompositePost } from '@/helpers/getCompositePost.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { getProfileSessionsAll } from '@/helpers/getProfileState.js';
import { getScheduleTaskContent } from '@/helpers/getScheduleTaskContent.js';
import { resolveCreateSchedulePostPayload } from '@/helpers/resolveCreateSchedulePostPayload.js';
import { resolveSocialSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { ComposeModalRef, EnableSignlessModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { captureComposeSchedulePostEvent } from '@/providers/telemetry/captureComposeEvent.js';
import { capturePollEvent } from '@/providers/telemetry/capturePollEvent.js';
import { EventId } from '@/providers/types/Telemetry.js';
import { uploadSessions } from '@/services/metrics.js';
import { commitPoll } from '@/services/poll.js';
import { schedulePost } from '@/services/post.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
import type { ComposeType } from '@/types/compose.js';

export async function createSchedulePostsPayload(
    type: ComposeType,
    compositePost: CompositePost,
    isThread = false,
    signal?: AbortSignal,
) {
    const { updatePollId } = useComposeStateStore.getState();
    const { chars, poll, availableSources } = compositePost;

    if (poll && SUPPORTED_FRAME_SOURCES.some((x) => availableSources.includes(x))) {
        const pollId = await commitPoll(poll, readChars(chars));

        updatePollId(pollId);
        capturePollEvent(pollId);
    }

    const allProfiles = getCurrentProfileAll();
    const updatedCompositePost = getCompositePost(compositePost.id);
    if (!updatedCompositePost) throw new Error(`Post not found with id: ${compositePost.id}`);

    return Promise.all(
        availableSources.map(async (x) => {
            const profile = allProfiles[x];
            if (!profile) throw new UnauthorizedError();
            const payload = await resolveCreateSchedulePostPayload(x)(type, updatedCompositePost, isThread, signal);

            return {
                platformUserId: profile.profileId,
                platform: resolveSocialSourceInUrl(x),
                payload,
            };
        }),
    );
}

export async function crossSchedulePost(
    type: ComposeType,
    compositePost: CompositePost,
    scheduleTime: Date,
    signal?: AbortSignal,
) {
    try {
        checkScheduleTime(scheduleTime);

        const posts = await createSchedulePostsPayload(type, compositePost, false, signal);

        await useLensStateStore.getState().refreshCurrentAccount();
        await uploadSessions('merge', fireflySessionHolder.sessionRequired, getProfileSessionsAll());

        const result = await schedulePost(
            scheduleTime,
            posts.map((x) => ({
                ...x,
                payload: JSON.stringify([x.payload]),
            })),
            {
                content: getScheduleTaskContent(compositePost),
                type,
            },
        );
        if (!result) return;

        captureComposeSchedulePostEvent(EventId.COMPOSE_SCHEDULED_POST_CREATE_SUCCESS, compositePost, {
            scheduleId: result,
        });

        enqueueSuccessMessage(
            <span>
                <Trans>
                    Your post will be sent on {dayjs(scheduleTime).format('DD MMM, YYYY')} at{' '}
                    {dayjs(scheduleTime).format('hh:mm A')}{' '}
                    <span
                        className="cursor-pointer underline"
                        onClick={() => {
                            ComposeModalRef.open({
                                initialPath: urlcat('/draft', { tab: DraftPageTab.Scheduled }),
                            });
                        }}
                    >
                        View
                    </span>
                </Trans>
            </span>,
        );
    } catch (error) {
        if (error instanceof CreateScheduleError) {
            enqueueInfoMessage(error.message);
        } else if (error instanceof SignlessRequireError) {
            EnableSignlessModalRef.open();
        } else {
            if (error instanceof ConnectorNotConnectedError) throw error;
            enqueueMessageFromError(error, t`Failed to create schedule post.`);
        }
        throw error;
    }
}
