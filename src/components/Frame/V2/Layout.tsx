import { memo, type ReactNode } from 'react';

import type { Post } from '@/providers/types/SocialMedia.js';
import type { FrameV2 } from '@/types/frame.js';

interface FrameLayoutProps {
    post: Post;
    frame: FrameV2;
    children?: ReactNode;
}

export const FrameLayout = memo<FrameLayoutProps>(function FrameLayout({ post, children }) {
    return null;
});
