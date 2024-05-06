import { useSuspenseQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { Quote } from '@/components/Posts/Quote.js';
import { type SocialSourceInURL, Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import { useImpressionsStore } from '@/store/useImpressionsStore.js';

interface PostEmbedProps {
    id: string;
    source: SocialSourceInURL;
}

export const PostEmbed = memo<PostEmbedProps>(function PostEmbed({ id, source }) {
    const currentSource = resolveSocialSource(source);
    const fetchAndStoreViews = useImpressionsStore.use.fetchAndStoreViews();

    const { data } = useSuspenseQuery({
        queryKey: [currentSource, 'post-detail', id],
        queryFn: async () => {
            if (!id) return null;

            try {
                const provider = resolveSocialMediaProvider(currentSource);
                const post = await provider.getPostById(id);
                if (currentSource === Source.Lens) fetchAndStoreViews([post.postId]);
                return post;
            } catch {
                return null;
            }
        },
    });

    if (!data) return;

    return <Quote post={data} />;
});
