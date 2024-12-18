import type { ReactNode } from 'react';

import { FrameLayout as FrameLayoutV1 } from '@/components/Frame/V1/Layout.js';
import { FrameLayout as FrameLayoutV2 } from '@/components/Frame/V2/Layout.js';
import { isFrameV1, isFrameV2 } from '@/helpers/frame.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';

interface FrameLayoutProps {
    frame: Frame;
    post: Post;
    children?: ReactNode;
}

export function FrameLayout({ frame, post, children }: FrameLayoutProps) {
    if (isFrameV2(frame)) {
        return (
            <FrameLayoutV2 frame={frame} post={post}>
                {children}
            </FrameLayoutV2>
        );
    }

    if (isFrameV1(frame)) {
        return (
            <FrameLayoutV1 frame={frame} post={post}>
                {children}
            </FrameLayoutV1>
        );
    }

    return null;
}
