import { type SocialSource, Source } from '@/constants/enum.js';
import { getVideoDuration } from '@/helpers/getVideoDuration.js';

export async function validateVideoDuration(availableSources: SocialSource[], file: File) {
    if (availableSources.includes(Source.Twitter)) {
        const duration = await getVideoDuration(file);
        return {
            isValid: duration <= 140,
            duration,
            maxDuration: 140,
        };
    }

    return {
        isValid: true,
        duration: 0,
        maxDuration: 0,
    };
}
