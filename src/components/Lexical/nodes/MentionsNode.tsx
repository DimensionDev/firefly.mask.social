import { addClassNamesToElement } from '@lexical/utils';
import { type EditorConfig, type LexicalNode, type NodeKey, type SerializedTextNode, TextNode } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';

import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { FireflyPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialSourceFromFireflyPlatform } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/Firefly.js';

export class MentionNode extends TextNode {
    __profiles?: Profile[];
    static override getType(): string {
        return 'mention';
    }

    static override clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__text, node.__profiles, node.__key);
    }

    constructor(mentionName: string, profiles?: Profile[], key?: NodeKey) {
        super(!mentionName.startsWith('@') ? `@${mentionName}` : mentionName, key);
        if (profiles) this.__profiles = profiles;
    }

    override createDOM(config: EditorConfig): HTMLElement {
        const element = super.createDOM(config);
        addClassNamesToElement(element, config.theme.mention);
        if (this.__profiles) {
            const sources = document.createElement('div');

            const html = renderToStaticMarkup(
                <>
                    {this.__profiles.map(({ platform, handle, platform_id }, index) => {
                        return platform === FireflyPlatform.Wallet ? null : (
                            <span
                                title={`@${handle}`}
                                className={classNames('inline-flex items-center', {
                                    '-ml-1': index > 0 && self.length > 1,
                                })}
                                key={platform_id}
                            >
                                <SocialSourceIcon source={resolveSocialSourceFromFireflyPlatform(platform)} size={16} />
                            </span>
                        );
                    })}
                </>,
            );
            sources.innerHTML = html;
            sources.setAttribute('class', 'flex items-center -space-x-1');
            element.setAttribute(
                'class',
                'inline-flex items-center gap-2 py-1 px-3 rounded-full border border-link text-highlight leading-4',
            );
            element.insertBefore(sources, element.firstChild);
        }
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

export function $createMentionNode(text = '', profiles?: Profile[]): MentionNode {
    const mentionNode = new MentionNode(text, profiles);
    mentionNode.setMode('segmented').toggleDirectionless();

    return mentionNode;
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
    return node instanceof MentionNode;
}
