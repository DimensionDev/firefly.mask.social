import { t, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import urlcat from 'urlcat';

import { DraftPageTab } from '@/components/Compose/DraftPage.js';
import { CreateScheduleError, SignlessRequireError, UnauthorizedError } from '@/constants/error.js';
import { SUPPORTED_FRAME_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, readChars } from '@/helpers/chars.js';
import { checkScheduleTime } from '@/helpers/checkScheduleTime.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { getProfileSessionsAll } from '@/helpers/getProfileState.js';
import { getScheduleTaskContent } from '@/helpers/getScheduleTaskContent.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveCreateSchedulePostPayload } from '@/helpers/resolveCreateSchedulePostPayload.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { ComposeModalRef, EnableSignlessModalRef } from '@/modals/controls.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { uploadSessions } from '@/services/metrics.js';
import { commitPoll } from '@/services/poll.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export async function createSchedulePostsPayload(type: ComposeType, compositePost: CompositePost, isThread = false) {
    const { chars, poll, availableSources } = compositePost;
    if (poll && SUPPORTED_FRAME_SOURCES.some((x) => availableSources.includes(x))) {
        const pollId = await commitPoll(poll, readChars(chars));
        compositePost = {
            ...compositePost,
            chars: (Array.isArray(chars) ? chars : [chars]).map((x) => {
                if (typeof x !== 'string' && x.tag === CHAR_TAG.FRAME) {
                    return { ...x, id: pollId };
                }
                return x;
            }),
            poll: {
                ...poll,
                id: pollId,
            },
        };
    }

    const allProfiles = getCurrentProfileAll();

    return Promise.all(
        availableSources.map(async (x) => {
            const profile = allProfiles[x];
            if (!profile) throw new UnauthorizedError();
            const payload = await resolveCreateSchedulePostPayload(x)(type, compositePost, isThread);

            return {
                platformUserId: profile.profileId,
                platform: resolveSocialSourceInURL(x),
                payload,
            };
        }),
    );
}

export async function crossSchedulePost(type: ComposeType, compositePost: CompositePost, scheduleTime: Date) {
    try {
        checkScheduleTime(scheduleTime);

        const posts = await createSchedulePostsPayload(type, compositePost);

        const content = getScheduleTaskContent(compositePost);

        await uploadSessions('merge', fireflySessionHolder.sessionRequired, getProfileSessionsAll());

        const result = await FireflySocialMediaProvider.schedulePost(
            scheduleTime,
            posts.map((x) => ({
                ...x,
                payload: JSON.stringify([x.payload]),
            })),
            {
                content,
                type,
            },
        );

        if (!result) return;

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
            enqueueErrorMessage(error.message);
        } else if (error instanceof SignlessRequireError) {
            EnableSignlessModalRef.open();
        } else {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to create schedule post.`), {
                error,
            });
        }
        throw error;
    }
}
