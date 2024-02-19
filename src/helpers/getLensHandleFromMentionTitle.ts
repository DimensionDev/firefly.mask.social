export function getLensHandleFromMentionTitle(mentionTitle: string) {
    return mentionTitle.replace(/^@lens\//i, '').replace(/^@([^\s]+)\.lens/i, '$1');
}
