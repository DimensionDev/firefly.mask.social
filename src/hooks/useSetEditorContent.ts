import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { safeUnreachable } from '@masknet/kit';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useCallback } from 'react';

import { $createMentionNode } from '@/components/Lexical/nodes/MentionsNode.js';
import { CHAR_TAG, type Chars } from '@/helpers/chars.js';
import { getPollFrameUrl } from '@/helpers/getPollFrameUrl.js';

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
                        } else {
                            const { tag } = x;
                            switch (tag) {
                                case CHAR_TAG.FIREFLY_RP:
                                    paragraphNode.append($createTextNode(x.content));
                                    break;
                                case CHAR_TAG.FRAME:
                                    paragraphNode.append($createTextNode(getPollFrameUrl(x.id)));
                                    break;
                                case CHAR_TAG.MENTION:
                                    paragraphNode.append($createMentionNode(x.content, x.profiles));
                                    break;
                                default:
                                    safeUnreachable(tag);
                                    break;
                            }
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
