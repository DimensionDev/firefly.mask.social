import { PostInfoProvider, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { memo } from 'react';

import { usePostInfo } from '@/mask/hooks/usePostInfo.js';
import { createInjectHooksRenderer } from '@/maskbook/packages/plugin-infra/src/entry-dom.js';
import { MaskPostExtraPluginWrapper } from '@/maskbook/packages/shared/src/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';

const PluginHooksRenderer = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useAnyMode,
    (plugin) => plugin.PostInspector,
    MaskPostExtraPluginWrapper,
);

interface Props {
    post: Post;
}

export const PostInspector = memo<Props>(function PostInspector({ post }) {
    const postInfo = usePostInfo(post);

    return (
        <PostInfoProvider post={postInfo}>
            <PluginHooksRenderer />
        </PostInfoProvider>
    );
});
