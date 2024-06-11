import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useCallback } from 'react';

import { $createMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';

export function useSetEditorContent() {
    const [editor] = useLexicalComposerContext();
    return useCallback(
        (content: string | Chars) => {
            editor.update(() => {
                const root = $getRoot();
                const paragraphNode = $createParagraphNode();
                if (typeof content === 'string') {
                    const textNode = $createTextNode(content);
                    paragraphNode.append(textNode);
                    root.clear();
                    root.append(paragraphNode);
                    root.selectEnd();
                } else {
                    for (const x of content) {
                        if (typeof x === 'string') {
                            const textNode = $createTextNode(x);
                            paragraphNode.append(textNode);
                        } else if (x.tag === CHAR_TAG.FIREFLY_RP) {
                            const textNode = $createTextNode(x.content);
                            paragraphNode.append(textNode);
                        } else {
                            const mentionNode = $createMentionNode(x.content, x.profiles);

                            paragraphNode.append(mentionNode);
                        }
                    }

                    root.clear();
                    root.append(paragraphNode);
                    root.selectEnd();
                }
            });
        },
        [editor],
    );
}
