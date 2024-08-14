import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

import { PollCard } from '@/components/Poll/PollCard.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPoll } from '@/services/poll.js';

interface FramePollProps {
    pollId: string;
    post: Post;
    frameUrl: string;
}

export const FramePoll = memo<FramePollProps>(function FramePoll({ pollId, post, frameUrl }) {
    const profile = useCurrentProfile(post.source);
    const { isLoading, data } = useQuery({
        queryKey: ['poll', post.source, pollId, profile?.profileId],
        queryFn: () => getPoll(pollId, post.source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 1000 * 60 * 1,
    });

    if (isLoading || !data) return null;

    return <PollCard frameUrl={frameUrl} post={{ ...post, poll: data }} />;
});
