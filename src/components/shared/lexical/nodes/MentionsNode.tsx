import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode } from 'lexical';

import { addClassNamesToElement } from '@lexical/utils';
import { TextNode } from 'lexical';

export class MentionNode extends TextNode {
    static getType(): string {
        return 'mention';
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__text, node.__key);
    }

    constructor(text: string, key?: NodeKey) {
        super(text, key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        addClassNamesToElement(element, config.theme.mention);
        return element;
    }

    static importJSON(serializedNode: SerializedTextNode): MentionNode {
        const node = $createMentionNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    exportJSON(): SerializedTextNode {
        return {
            ...super.exportJSON(),
            type: 'mention',
        };
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    isTextEntity(): true {
        return true;
    }
}

export function $createMentionNode(text = ''): MentionNode {
    return new MentionNode(text);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
    return node instanceof MentionNode;
}
