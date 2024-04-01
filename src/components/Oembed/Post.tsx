import { safeUnreachable } from '@masknet/kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { Quote } from '@/components/Posts/Quote.js';
import { SocialPlatform, type SourceInURL } from '@/constants/enum.js';
import { resolveSocialPlatform } from '@/helpers/resolveSocialPlatform.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostEmbedProps {
    id: string;
    source: SourceInURL;
}

export const PostEmbed = memo<PostEmbedProps>(function PostEmbed({ id, source }) {
    const currentSource = resolveSocialPlatform(source);
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', id],
        queryFn: async () => {
            if (!id) return null;
            try {
                switch (currentSource) {
                    case SocialPlatform.Lens: {
                        const post = await LensSocialMediaProvider.getPostById(id);
                        fetchAndStoreViews([post.postId]);
                        return post;
                    }
                    case SocialPlatform.Farcaster: {
                        return await FarcasterSocialMediaProvider.getPostById(id);
                    }
                    case SocialPlatform.Twitter:
                        return await TwitterSocialMediaProvider.getPostById(id);

                    default:
                        safeUnreachable(currentSource);
                        return null;
                }
            } catch {
                return null;
            }
        },
    });

    if (!data) return;

    return <Quote post={data} />;
});
