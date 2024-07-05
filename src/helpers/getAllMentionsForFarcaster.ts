import { CastType } from '@farcaster/core';
import { first } from 'lodash-es';

import { MENTION_REGEX } from '@/constants/regexp.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';

export async function getAllMentionsForFarcaster(text: string) {
    const replacedIndices = [];
    const mentions = [];
    if (!text) {
        return {
            text: '',
            mentionsPositions: [],
            mentions: [],
            type: CastType.CAST,
        };
    }
    let match;
    const regex = new RegExp(MENTION_REGEX);
    while ((match = regex.exec(text)) !== null) {
        try {
            let mentionTag = '';
            if (!match[0]) continue;
            mentionTag = match[0].substring(1);
            const profiles = await NeynarSocialMediaProvider.searchProfiles(mentionTag);
            const profile = first(profiles.data);
            if (profile?.fullHandle !== mentionTag) continue;
            const fid = profile?.profileId;
            if (fid) {
                mentions.push(Number(fid));
                const startIndex = match.index;
                const mentionStartIndex = Buffer.from(text.substring(0, startIndex)).length;
                const endIndex = regex.lastIndex;
                replacedIndices.push(mentionStartIndex);
                text = text.substring(0, startIndex) + text.substring(endIndex);
                regex.lastIndex = startIndex;
            }
        } catch (error) {
            console.log(error);
        }
    }

    return {
        text,
        mentionsPositions: replacedIndices,
        mentions,
        type: text.length > 320 ? CastType.LONG_CAST : CastType.CAST,
    };
}
