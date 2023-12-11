import type { Dispatch, SetStateAction } from 'react';

import ComposeAction from '@/components/Compose/ComposeAction.js';
import ComposeContent from '@/components/Compose/ComposeContent.js';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { IPFS_MediaObject } from '@/types/index.js';

interface IWithLexicalContextWrapper {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: string) => void;
    images: IPFS_MediaObject[];
    setImages: Dispatch<SetStateAction<IPFS_MediaObject[]>>;
    setLoading: (loading: boolean) => void;
    post?: Post;
}
function WithLexicalContextWrapper({
    type,
    setCharacters,
    images,
    setImages,
    setLoading,
    post,
}: IWithLexicalContextWrapper) {
    return (
        <>
            {/* Content */}
            <ComposeContent
                type={type}
                setCharacters={setCharacters}
                images={images.map((image) => image.file)}
                setImages={setImages}
                post={post}
            />

            {/* Action */}
            <ComposeAction type={type} images={images} setImages={setImages} setLoading={setLoading} post={post} />
        </>
    );
}

export default withLexicalContext(WithLexicalContextWrapper);
