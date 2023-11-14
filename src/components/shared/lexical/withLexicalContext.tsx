import { ComponentType } from 'react';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

import { MentionNode } from './nodes/MentionsNode';

const initialConfig = {
    namespace: 'composer',
    theme: {
        // text: {
        // bold: 'bold',
        // italic: 'italic',
        // code: 'text-sm bg-gray-300 rounded-lg dark:bg-gray-700 px-[5px] py-[2px]',
        // },
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
