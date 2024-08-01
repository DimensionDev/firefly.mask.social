import { SourceInURL } from '@/constants/enum.js';
import { NotImplementedError, UnreachableError } from '@/constants/error.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';

export async function getProfilesByIds(source: SourceInURL, ids: string[]) {
    switch (source) {
        case SourceInURL.Farcaster:
            return await NeynarSocialMediaProvider.getProfilesByIds(ids);
        case SourceInURL.Lens:
            return await LensSocialMediaProvider.getProfilesByIds(ids);
        case SourceInURL.Twitter:
            return await TwitterSocialMediaProvider.getProfilesByIds(ids);
        case SourceInURL.Firefly:
        case SourceInURL.Article:
        case SourceInURL.Wallet:
        case SourceInURL.NFTs:
            throw new NotImplementedError(`getProfilesByIds is not implemented for source=${source}`);
        default:
            throw new UnreachableError('Unknown source', source);
    }
}
