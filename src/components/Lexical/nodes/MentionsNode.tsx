import { addClassNamesToElement } from '@lexical/utils';
import { type SerializedTextNode, TextNode } from 'lexical';
import type { EditorConfig } from 'lexical/LexicalEditor.js';
import type { LexicalNode, NodeKey } from 'lexical/LexicalNode.js';

export class MentionNode extends TextNode {
    static override getType(): string {
        return 'mention';
    }

    static override clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__text, node.__key);
    }

    constructor(mentionName: string, key?: NodeKey) {
        super(`@${mentionName}`, key);
    }

    override createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        addClassNamesToElement(element, config.theme.mention);
        return element;
    }

    static override importJSON(serializedNode: SerializedTextNode): MentionNode {
        const node = $createMentionNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    override exportJSON(): SerializedTextNode {
        return {
            ...super.exportJSON(),
            type: 'mention',
        };
    }

    override canInsertTextBefore(): boolean {
        return false;
    }

    override isTextEntity(): true {
        return true;
    }
}

export function $createMentionNode(text = ''): MentionNode {
    const mentionNode = new MentionNode(text);
    mentionNode.setMode('segmented').toggleDirectionless();

    return mentionNode;
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
    return node instanceof MentionNode;
}
