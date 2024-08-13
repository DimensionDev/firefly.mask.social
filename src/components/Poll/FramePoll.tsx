import { useQuery } from '@tanstack/react-query';
import { memo, useRef } from 'react';
import { useUpdateEffect } from 'react-use';

import { PollCard } from '@/components/Poll/PollCard.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { getPoll } from '@/services/commitPoll.js';

interface FramePollProps {
    pollId: string;
    post: Post;
    frameUrl: string;
}

export const FramePoll = memo<FramePollProps>(function FramePoll({ pollId, post, frameUrl }) {
    const profile = useCurrentProfile(post.source);
    const profileId = profile?.profileId;
    const { isLoading, data, refetch } = useQuery({
        queryKey: ['poll', post.source, pollId],
        queryFn: () => getPoll(pollId, post.source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 1000 * 60 * 1,
    });
    const lastProfileId = useRef(profileId);

    useUpdateEffect(() => {
        if (profileId && lastProfileId.current !== profileId) {
            refetch();
            lastProfileId.current = profileId;
        }
    }, [profileId]);

    if (isLoading || !data) return null;

    return <PollCard frameUrl={frameUrl} post={{ ...post, poll: data }} />;
});
