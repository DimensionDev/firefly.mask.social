import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { $createParagraphNode, $createTextNode, $getRoot, ParagraphNode } from 'lexical';
import { useCallback } from 'react';

import { $createMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { CHAR_TAG, type Chars, type ComplexChars } from '@/helpers/chars.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';

function updateParagraphNode(paragraphNode: ParagraphNode, chars: ComplexChars) {
    const { tag, visible } = chars;
    if (!visible) return;
    switch (tag) {
        case CHAR_TAG.FIREFLY_RP:
            paragraphNode.append($createTextNode(`${chars.content}\n`));
            break;
        case CHAR_TAG.FRAME:
            break;
        case CHAR_TAG.MENTION:
            paragraphNode.append($createMentionNode(chars.content, chars.profiles));
            break;
        default:
            safeUnreachable(tag);
            break;
    }
}

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
                            paragraphNode.append($createTextNode(x));
                        } else {
                            updateParagraphNode(paragraphNode, x);
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
