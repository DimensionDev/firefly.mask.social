import { $isAutoLinkNode, AutoLinkNode } from '@lexical/link';
import { $getSelection, $isRangeSelection } from 'lexical';
import type { LexicalEditor, RangeSelection } from 'lexical/index.js';

import { MENTION_REGEX } from '@/constants/regexp.js';
import { trimify } from '@/helpers/trimify.js';

interface QueryText {
    text: string;
    matchedNode?: AutoLinkNode;
}

function getTextUpToAnchor(selection: RangeSelection): QueryText | null {
    const anchor = selection.anchor;
    if (anchor.type !== 'text') {
        return null;
    }

    const anchorNode = anchor.getNode();
    if (!anchorNode.isSimpleText()) {
        return null;
    }

    const anchorOffset = anchor.offset;
    const prevSibling = anchorNode.getPreviousSibling();
    const prevSiblingText = prevSibling?.getTextContent() ?? '';
    MENTION_REGEX.lastIndex = 0;

    if (
        anchorOffset === 0
        && $isAutoLinkNode(prevSibling)
        && MENTION_REGEX.test(prevSiblingText)
    ) {
        return { text: prevSiblingText, matchedNode: prevSibling };
    }
    return null;
}

function getQueryTextForSearch(editor: LexicalEditor): QueryText | null {
    let text = null;
    editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
            return;
        }
        text = getTextUpToAnchor(selection);
    });
    return text;
}

export const getSafeMentionQueryText = (text: string, editor: LexicalEditor, isUpdating: boolean) => {
    if (trimify(text) || isUpdating) return { text };
    return getQueryTextForSearch(editor);
};
