import type { RP_HASH_TAG } from '@/constants/index.js';

/**
 * chars with metadata
 */
interface ComplexChars {
    // tag is used to identify the type of content
    tag: string;
    // if visible is false, content will not be displayed
    // but the length of content will be counted
    visible: boolean;
    // content is the actual content
    content: string;
}

interface RP_Chars extends ComplexChars {
    tag: 'ff_rp';
    visible: boolean;
    content: typeof RP_HASH_TAG;
}

// the RP_Chars is invisible and always stay at the end of the string
export type Chars = string | [RP_Chars, string];

export function readChars(chars: Chars, visibleOnly = false) {
    return (Array.isArray(chars) ? chars : [chars])
        .map((x) => (typeof x === 'string' ? x : x.visible || !visibleOnly ? x.content : ''))
        .join('\n');
}

export function writeChars(chars: Chars, newChars: Chars): Chars {
    const getTextKind = (chars: Chars) => {
        if (typeof chars === 'string') return chars;
        if (Array.isArray(chars)) return chars[1];
        return;
    };
    const getRP_Kind = (chars: Chars) => {
        if (Array.isArray(chars)) return chars[0];
        return;
    };

    const textKind = getTextKind(newChars) ?? getTextKind(chars) ?? '';
    const RP_Kind = getRP_Kind(newChars) ?? getRP_Kind(chars);

    if (RP_Kind) return [RP_Kind, textKind];
    return textKind;
}

export function measureChars(chars: Chars) {
    const length = readChars(chars).length;
    const visibleLength = readChars(chars, true).length;
    return {
        length,
        visibleLength,
        invisibleLength: length - visibleLength,
    };
}
