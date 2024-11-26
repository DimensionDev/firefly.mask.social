import { PostInfoProvider, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script';
import { createInjectHooksRenderer } from '@masknet/plugin-infra/dom';
import { memo } from 'react';

import { MaskPostExtraPluginWrapper } from '@/mask/bindings/components.js';
import { usePostInfo } from '@/mask/hooks/usePostInfo.js';
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
