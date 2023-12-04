import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import type { ComponentType } from 'react';

import { MentionNode } from '@/components/shared/lexical/nodes/MentionsNode.js';

const initialConfig = {
    namespace: 'composer',
    theme: {
        link: 'text-link',
        hashtag: 'text-link',
        mention: 'text-link',
    },
    nodes: [MentionNode, HashtagNode, AutoLinkNode, LinkNode],
    editorState: null,
    onError: () => {},
};

const withLexicalContext = (Component: ComponentType<any>) => {
    function LexicalContext(props: any) {
        return (
            <LexicalComposer initialConfig={{ ...initialConfig }}>
                <Component {...props} />
            </LexicalComposer>
        );
    }

    return LexicalContext;
};

export default withLexicalContext;
