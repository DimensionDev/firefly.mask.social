import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer.js';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { type ComponentType, useMemo } from 'react';

import { MentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

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
        const { chars } = useComposeStateStore();
        const config = useMemo<InitialConfigType>(() => {
            return {
                ...initialConfig,
                editorState: chars
                    ? (editor) => {
                          if (!chars) return;
                          editor.update(() => {
                              const root = $getRoot();
                              const paragraph = $createParagraphNode();
                              const text = $createTextNode(chars);
                              paragraph.append(text);
                              root.append(paragraph);
                              root.selectEnd();
                          });
                      }
                    : null,
            };
        }, [chars]);

        return (
            <LexicalComposer initialConfig={config}>
                <Component {...props} />
            </LexicalComposer>
        );
    }

    return LexicalContext;
};

export default withLexicalContext;
