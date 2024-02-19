/**
 * Examples of mention titles in the returned post:
 * - @lens/handle
 * - @handle.lens
 *
 * @param mentionTitle
 * @returns
 */
export function getLensHandleFromMentionTitle(mentionTitle: string) {
    return mentionTitle.replace(/^@lens\//i, '').replace(/^@([^\s]+)\.lens/i, '$1');
}
