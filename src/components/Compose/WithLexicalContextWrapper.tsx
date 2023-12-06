import type { Dispatch, SetStateAction } from 'react';

import ComposeAction from '@/components/Compose/ComposeAction.js';
import ComposeContent from '@/components/Compose/ComposeContent.js';
import type { IImage } from '@/components/Compose/index.js';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext.js';
import type { Post } from '@/providers/types/SocialMedia.js';

interface IWithLexicalContextWrapper {
    type: 'compose' | 'quote' | 'reply';
    setCharacters: (characters: string) => void;
    images: IImage[];
    setImages: Dispatch<SetStateAction<IImage[]>>;
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
            <ComposeAction type={type} images={images} setImages={setImages} setLoading={setLoading} />
        </>
    );
}

export default withLexicalContext(WithLexicalContextWrapper);
