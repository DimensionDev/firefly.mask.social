import { skipToken, useQuery } from '@tanstack/react-query';

import type { BookmarkType, FireflyPlatform } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useHasBookmarked(platform: FireflyPlatform, id: string, postType?: BookmarkType, disabled?: boolean) {
    return useQuery({
        queryKey: ['has-bookmarked', platform, id],
        staleTime: 1000 * 60 * 5,
        enabled: !disabled,
        queryFn: disabled
            ? skipToken
            : async () => {
                  const data = await FireflySocialMediaProvider.getBookmarksByIds(platform, [id], postType);

                  return data[0]?.post_id === id && !!data[0].has_book_marked;
              },
    });
}
