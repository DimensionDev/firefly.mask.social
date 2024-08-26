import { t } from '@lingui/macro';
import { toInteger, uniqBy } from 'lodash-es';
import { toBytes } from 'viem';

import { Source, SourceInURL } from '@/constants/enum.js';
import { MAX_IMAGE_SIZE_PER_POST } from '@/constants/index.js';
import { readChars } from '@/helpers/chars.js';
import { getAllMentionsForFarcaster } from '@/helpers/getAllMentionsForFarcaster.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';
import { isHomeChannel } from '@/helpers/isSameChannel.js';
import { createS3MediaObject, resolveImageUrl, resolveVideoUrl } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { FarcasterPollProvider } from '@/providers/farcaster/Poll.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';
import { type ComposeType } from '@/types/compose.js';

export interface FarcasterSchedulePostPayload {
    text: string;
    mentionsPositions: number[];
    mentions: number[];
    embedsDeprecated: string[];
    embeds: Array<{ url: string } | { castId: { fid: number; hash: Uint8Array } }>;
    parentCastId?: { fid: number; hash: Uint8Array };
    parentUrl?: string;
}

export async function createFarcasterSchedulePostPayload(
    type: ComposeType,
    compositePost: CompositePost,
    isThread = false,
): Promise<FarcasterSchedulePostPayload> {
    const { chars, parentPost, images, frames, openGraphs, video, channel, poll } = compositePost;

    const sourceName = resolveSourceName(Source.Farcaster);
    const farcasterParentPost = parentPost.Farcaster;
    // login required
    const { currentProfile } = useFarcasterStateStore.getState();

    if (!currentProfile?.profileId) throw new Error(t`Login required to post on ${sourceName}.`);

    const imageResults = await Promise.all(
        images.map(async (media) => {
            if (resolveImageUrl(Source.Farcaster, media)) return media;
            return createS3MediaObject(await uploadToS3(media.file, SourceInURL.Farcaster), media);
        }),
    );

    const videoResults = await Promise.all(
        (video?.file ? [video] : []).map(async (media) => {
            return createS3MediaObject(await uploadToS3(media.file, SourceInURL.Farcaster), media);
        }),
    );

    const pollResults = !poll
        ? []
        : [await FarcasterPollProvider.createPoll(poll, readChars(chars, 'both', Source.Farcaster))];

    const currentChannel = channel[Source.Farcaster];
    const content = readChars(chars, 'both', Source.Farcaster);

    const result = await getAllMentionsForFarcaster(content);

    const mediaObjects = uniqBy(
        [
            ...imageResults.map((media) => ({
                url: resolveImageUrl(Source.Farcaster, media),
                mimeType: media.mimeType,
            })),
            ...videoResults.map((media) => ({
                url: resolveVideoUrl(Source.Farcaster, media),
                mimeType: media.mimeType,
            })),
            ...frames.map((frame) => ({ title: frame.title, url: frame.url })),
            ...openGraphs.map((openGraph) => ({ title: openGraph.title!, url: openGraph.url })),
            ...pollResults.map((poll) => ({
                url: getPollFrameUrl(poll.id, Source.Farcaster),
            })),
        ],
        (x) => x.url.toLowerCase(),
    ).slice(0, MAX_IMAGE_SIZE_PER_POST[Source.Farcaster]);

    const embeds = mediaObjects?.map((v) => ({ url: v.url })) ?? [];
    const payload = {
        ...result,
        embedsDeprecated: [],
        embeds:
            type === 'quote' && farcasterParentPost
                ? [
                      {
                          castId: {
                              fid: toInteger(farcasterParentPost.author.profileId),
                              hash: toBytes(farcasterParentPost.postId),
                          },
                      },
                      ...embeds,
                  ]
                : embeds,
        parentCastId: !isThread
            ? type === 'reply' && farcasterParentPost
                ? {
                      fid: toInteger(farcasterParentPost.author.profileId),
                      hash: toBytes(farcasterParentPost.postId),
                  }
                : undefined
            : undefined,
        parentUrl: currentChannel && !isHomeChannel(currentChannel) ? currentChannel.parentUrl : undefined,
    };

    return payload;
}
