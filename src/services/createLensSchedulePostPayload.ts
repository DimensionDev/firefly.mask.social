import { t } from '@lingui/macro';

import { config } from '@/configs/wagmiClient.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { CreateScheduleError, SignlessRequireError } from '@/constants/error.js';
import { SITE_URL } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { resolveLensOperationName, resolveLensQuery } from '@/helpers/resolveLensQuery.js';
import { createS3MediaObject, resolveImageUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { createPayloadAttachments, createPostMetadata } from '@/services/postToLens.js';
import { uploadAndConvertToM3u8 } from '@/services/uploadAndConvertToM3u8.js';
import { uploadToArweave } from '@/services/uploadToArweave.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useLensStateStore } from '@/store/useProfileStore.js';
import { type ComposeType } from '@/types/compose.js';

export interface LensSchedulePayload {
    operationName: 'PostOnMomoka' | 'QuoteOnMomoka' | 'CommentOnMomoka';
    variables: {
        request: {
            contentURI: `ar://${string}`;
            quoteOn?: string;
            commentOn?: string;
        };
    };
    query: string;
}

export async function createLensSchedulePostPayload(
    type: ComposeType,
    compositePost: CompositePost,
    isThread = false,
    signal?: AbortSignal,
): Promise<LensSchedulePayload> {
    const { images, video, chars, parentPost } = compositePost;

    const lensParentPost = parentPost.Lens;
    const sourceName = resolveSourceName(Source.Lens);

    const imageResults = await Promise.all(
        images.map(async (media) => {
            if (resolveImageUrl(Source.Lens, media)) return media;
            return createS3MediaObject(await uploadToS3(media.file, SourceInURL.Lens), media);
        }),
    );

    const videoResult = video?.file
        ? createS3MediaObject(await uploadAndConvertToM3u8(video.file, SourceInURL.Lens, signal), video)
        : null;

    const { currentProfile } = useLensStateStore.getState();
    if (!currentProfile?.profileId) throw new Error(t`Login required to schedule post on ${sourceName}`);

    // Request the user settings
    const { signless } = await LensSocialMediaProvider.getProfileById(currentProfile?.profileId);

    if (!signless) {
        const { account } = await getWalletClientRequired(config);
        if (!isSameEthereumAddress(currentProfile?.ownedBy?.address, account.address)) {
            throw new CreateScheduleError(t`Please switch to the wallet consistent with this action`);
        }

        throw new SignlessRequireError('Signless required');
    }

    const title = `Post by #${currentProfile.handle}`;
    const content = readChars(chars, 'both', Source.Lens);
    const metadata = createPostMetadata(
        {
            title,
            content,
            marketplace: {
                name: title,
                description: content,
                external_url: SITE_URL,
            },
        },
        await createPayloadAttachments(imageResults, videoResult),
    );

    const tokenRes = await lensSessionHolder.sdk.authentication.getAccessToken();
    const token = tokenRes.unwrap();
    const arweaveId = await uploadToArweave(metadata, token);

    const commentOn =
        type === 'reply'
            ? lensParentPost
                ? lensParentPost.postId
                : isThread
                  ? '$$commentOn$$'
                  : undefined
            : undefined;

    return {
        operationName: resolveLensOperationName(type),
        variables: {
            request: {
                contentURI: `ar://${arweaveId}`,
                quoteOn: type === 'quote' && lensParentPost ? lensParentPost.postId : undefined,
                commentOn,
            },
        },
        query: resolveLensQuery(type),
    };
}
