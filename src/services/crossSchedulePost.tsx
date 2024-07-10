import { t } from '@lingui/macro';

import { UnauthorizedError } from '@/constants/error.js';
import { SUPPORTED_FRAME_SOURCES } from '@/constants/index.js';
import { CHAR_TAG, readChars } from '@/helpers/chars.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import { resolveCreateSchedulePostPayload } from '@/helpers/resolveCreateSchedulePostPayload.js';
import { resolveSocialSourceInURL } from '@/helpers/resolveSourceInURL.js';
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
                platformUserId: profile?.profileId,
                platform: resolveSocialSourceInURL(x),
                payload,
            };
        }),
    );
}

export async function crossSchedulePost(type: ComposeType, compositePost: CompositePost, scheduleTime: Date) {
    const posts = await createSchedulePostsPayload(type, compositePost);

    try {
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
        enqueueSuccessMessage(t`Your scheduled post has been created successfully.`);
    } catch (error) {
        enqueueErrorMessage('description', {
            error,
        });
        throw error;
    }
}
