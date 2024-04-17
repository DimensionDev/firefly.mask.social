import { memo } from 'react';

import type { Channel } from '@/providers/types/SocialMedia.js';

interface FollowButtonProps {
    channel: Channel;
}

export const FollowButton = memo(function FollowButton({ channel }: FollowButtonProps) {
    return null;
});
