import { Source } from '@/constants/enum.js';
import { measureChars } from '@/helpers/chars.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useProfileVerifyBadge } from '@/hooks/useProfileVerifyBadge.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function useMeasureCharsVerifySources() {
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const { data: badges } = useProfileVerifyBadge(twitterProfile ?? undefined);
    return {
        [Source.Twitter]: badges && badges.length > 0,
    };
}

export function useMeasureChars(post: CompositePost) {
    const verifiedSources = useMeasureCharsVerifySources();
    return measureChars(post, verifiedSources);
}
