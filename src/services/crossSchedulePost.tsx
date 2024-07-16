import { t, Trans } from '@lingui/macro';
import dayjs from 'dayjs';
import urlcat from 'urlcat';

import { DraftPageTab } from '@/components/Compose/DraftPage.js';
import { UnauthorizedError } from '@/constants/error.js';
import { SUPPORTED_FRAME_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, readChars } from '@/helpers/chars.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveCreateSchedulePostPayload } from '@/helpers/resolveCreateSchedulePostPayload.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { commitPoll } from '@/services/commitPoll.js';
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
        if (dayjs().add(7, 'day').isBefore(scheduleTime)) {
            throw new Error(t`Up to 7 days can be set as the scheduled time. Please reset it.`);
        } else if (dayjs().isAfter(scheduleTime, 'minute')) {
            throw new Error(t`The scheduled time has passed. Please reset it.`);
        }

        const posts = await createSchedulePostsPayload(type, compositePost);

        const result = await FireflySocialMediaProvider.schedulePost(
            scheduleTime,
            posts.map((x) => ({
                ...x,
                payload: JSON.stringify([x.payload]),
            })),
            {
                posts: [compositePost],
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
        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to create schedule post.`), {
            error,
        });
        throw error;
    }
}
