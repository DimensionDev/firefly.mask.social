import type { ReactNode } from 'react';

import { FrameLayout as FrameLayoutV1 } from '@/components/Frame/V1/Layout.js';
import { isFrameV1 } from '@/helpers/frame.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';

interface FrameLayoutProps {
    frame: Frame;
    post: Post;
    children?: ReactNode;
}

export function FrameLayout({ frame, post, children }: FrameLayoutProps) {
    if (isFrameV1(frame)) {
        return (
            <FrameLayoutV1 frame={frame} post={post}>
                {children}
            </FrameLayoutV1>
        );
    }

    return null;
}
