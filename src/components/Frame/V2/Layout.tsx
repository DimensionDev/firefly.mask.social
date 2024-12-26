import { memo, type ReactNode } from 'react';

import { Card } from '@/components/Frame/V2/Card.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { FrameV2 } from '@/types/frame.js';

interface FrameLayoutProps {
    post: Post;
    frame: FrameV2;
    children?: ReactNode;
}

export const FrameLayout = memo<FrameLayoutProps>(function FrameLayout({ post, frame }) {
    return (
        <div className="pt-2">
            <Card post={post} frame={frame} />
        </div>
    );
});
