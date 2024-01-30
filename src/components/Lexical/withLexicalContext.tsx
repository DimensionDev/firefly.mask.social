import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { type ComponentType, useMemo } from 'react';

import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';

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
        const config = useMemo<InitialConfigType>(() => {
            return {
                ...initialConfig,
            };
        }, []);

        return (
            <LexicalComposer initialConfig={config}>
                <Component {...props} />
            </LexicalComposer>
        );
    }

    return LexicalContext;
};

export default withLexicalContext;
