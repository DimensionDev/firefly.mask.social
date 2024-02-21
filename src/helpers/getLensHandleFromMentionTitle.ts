const MATCH_LENS_HANDLE_A_RE = /^@lens\/([^\s/@]+)$/i; // e.g., @lens/handle
const MATCH_LENS_HANDLE_B_RE = /^@([^\s/@]+)\.lens$/i; // e.g., @handle.lens
const MATCH_LENS_HANDLE_C_RE = /^@([^s/@]+)$/i; // e.g., @handle

/**
 * Examples of mention titles in the returned post:
 * - @lens/handle
 * - @handle.lens
 *
 * @param mentionTitle
 * @returns
 */
export function getLensHandleFromMentionTitle(mentionTitle: string) {
    if (MATCH_LENS_HANDLE_A_RE.test(mentionTitle)) return mentionTitle.replace(MATCH_LENS_HANDLE_A_RE, '$1');
    if (MATCH_LENS_HANDLE_B_RE.test(mentionTitle)) return mentionTitle.replace(MATCH_LENS_HANDLE_B_RE, '$1');
    if (MATCH_LENS_HANDLE_C_RE.test(mentionTitle)) return mentionTitle.replace(MATCH_LENS_HANDLE_C_RE, '$1');
    return;
}
