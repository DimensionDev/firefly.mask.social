import { forwardRef, useState } from 'react';

import { PreviewMedia } from '@/components/PreviewMedia/index.js';
import type { Source } from '@/constants/enum.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import type { Attachment, Post } from '@/providers/types/SocialMedia.js';

export interface PreviewMediaModalOpenProps {
    post?: Post;
    index: string;
    source: Source;
    medias?: Attachment[];
}

export const PreviewMediaModal = forwardRef<SingletonModalRefCreator<PreviewMediaModalOpenProps>>(
    function PreviewMediaModal(_, ref) {
        const [medias, setMedias] = useState<Attachment[]>();
        const [post, setPost] = useState<Post>();
        const [index, setIndex] = useState<string>('');
        const [source, setSource] = useState<Source>();
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setMedias(props.medias);
                setPost(props.post);
                setIndex(props.index);
                setSource(props.source);
            },
            onClose: () => {
                setMedias(undefined);
                setPost(undefined);
                setIndex('');
            },
        });
        return (
            <PreviewMedia
                post={post}
                medias={medias}
                source={source}
                index={index}
                open={open}
                onClose={() => dispatch?.close()}
            />
        );
    },
);
