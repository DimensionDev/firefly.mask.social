import { type SocialSource, Source, SourceInURL } from '@/constants/enum.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { uploadToS3 } from '@/services/uploadToS3.js';

export async function uploadProfileAvatar(source: SocialSource, file: File) {
    if (source === Source.Twitter) {
        return await TwitterSocialMediaProvider.uploadProfileAvatar(file);
    }
    return await uploadToS3(file, SourceInURL.Lens);
}
