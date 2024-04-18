import { queryClient } from '@/configs/queryClient.js';
import type { SocialPlatform } from '@/constants/enum.js';

export function refetchComments(source: SocialPlatform, postId: string) {
    return queryClient.refetchQueries({
        queryKey: ['posts', source, 'comments', postId],
    });
}
