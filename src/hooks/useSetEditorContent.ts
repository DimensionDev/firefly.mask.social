import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useCallback } from 'react';

export function useSetEditorContent() {
    const [editor] = useLexicalComposerContext();
    return useCallback(
        (content: string) => {
            editor.update(() => {
                const root = $getRoot();
                const paragraphNode = $createParagraphNode();
                const textNode = $createTextNode(content);
                paragraphNode.append(textNode);
                root.clear();
                root.append(paragraphNode);
                root.selectEnd();
            });
        },
        [editor],
    );
}
