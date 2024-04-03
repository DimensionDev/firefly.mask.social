import { MENTION_REGEX } from '@/constants/regex.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

export async function getAllMetnionsForFarcaster(text: string) {
    const replacedIndices = [];
    const mentions = [];
    if (!text) {
        return {
            text: '',
            mentionsPositions: [],
            mentions: [],
        };
    }
    let match;
    while ((match = MENTION_REGEX.exec(text)) !== null) {
        try {
            let mentionTag = '';
            if (match[0]) {
                mentionTag = match[0].substring(1);
            }
            const profile = await WarpcastSocialMediaProvider.getProfileByHandle(mentionTag);
            const fid = profile.profileId;
            if (fid) {
                mentions.push(Number(fid));
                const startIndex = match.index;
                const mentionStartIndex = Buffer.from(text.substring(0, startIndex)).length;
                const endIndex = MENTION_REGEX.lastIndex;
                replacedIndices.push(mentionStartIndex);
                text = text.substring(0, startIndex) + text.substring(endIndex);
                MENTION_REGEX.lastIndex = startIndex;
            }
        } catch (error) {
            console.log(error);
        }
    }

    return {
        text,
        mentionsPositions: replacedIndices,
        mentions,
    };
}
