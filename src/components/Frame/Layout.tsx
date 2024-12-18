import type { ReactNode } from 'react';

import { FrameLayout as FrameLayoutV1 } from '@/components/Frame/V1/Layout.js';
import { FrameLayout as FrameLayoutV2 } from '@/components/Frame/V2/Layout.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { isFrameV1, isFrameV2 } from '@/helpers/frame.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { Frame } from '@/types/frame.js';

interface FrameLayoutProps {
    frame: Frame;
    post: Post;
    children?: ReactNode;
}

export function FrameLayout({ frame, post, children }: FrameLayoutProps) {
    if (isFrameV2(frame) && env.external.NEXT_PUBLIC_FRAME_V2 === STATUS.Enabled) {
        return (
            <FrameLayoutV2 frame={frame} post={post}>
                {children}
            </FrameLayoutV2>
        );
    }

    if (isFrameV1(frame) && env.external.NEXT_PUBLIC_FRAME_V1 === STATUS.Enabled) {
        return (
            <FrameLayoutV1 frame={frame} post={post}>
                {children}
            </FrameLayoutV1>
        );
    }

    return null;
}
