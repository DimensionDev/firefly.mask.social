import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer.js';
import type { ComponentType } from 'react';

import { MentionNode } from '@/components/shared/lexical/nodes/MentionsNode.jsx';

const initialConfig = {
    namespace: 'composer',
    theme: {
        link: 'text-[#8E96FF]',
        hashtag: 'text-[#8E96FF]',
        mention: 'text-[#8E96FF]',
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
