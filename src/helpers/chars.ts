import { SocialPlatform } from '@/constants/enum.js';
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

export type Chars = string | RP_Chars | Array<string | RP_Chars>;

/**
 * Stringify chars into plain text
 * @param chars
 * @param visibleOnly
 * @returns
 */
export function readChars(chars: Chars, visibleOnly = false) {
    return (Array.isArray(chars) ? chars : [chars])
        .map((x) => (typeof x === 'string' ? x : x.visible || !visibleOnly ? x.content : ''))
        .join('\n');
}

export function writeChars(chars: Chars, newChars: Chars) {
    const charsWrapped = Array.isArray(chars) ? chars : [chars];
    const newCharsWrapped = Array.isArray(newChars) ? newChars : [newChars];

    return [
        // discard visible chars, only keep invisible ones
        ...charsWrapped.filter((x) => (typeof x === 'string' ? false : !x.visible)),
        ...newCharsWrapped,
    ];
}

function calculateLength(text: string, availableSources: SocialPlatform[]): number {
    return Array.from(text).reduce((acc, char) => {
        if (char.charCodeAt(0) > 128) {
            // learn more: https://www.notion.so/mask/Compose-post-83dd1d8deaff402093d52a49eed551be?pvs=4
            return acc + (availableSources.includes(SocialPlatform.Farcaster) ? 3 : 2);
        } else {
            return acc + 1;
        }
    }, 0);
}

export function measureChars(chars: Chars, availableSources: SocialPlatform[]) {
    const length = calculateLength(readChars(chars), availableSources);
    const visibleLength = calculateLength(readChars(chars, true), availableSources);
    return {
        length,
        visibleLength,
        invisibleLength: length - visibleLength,
    };
}
