export function removeAtEnd(content: string, fragment: string): string {
    content = content.trimEnd();

    const indexOfUrl = content.indexOf(fragment);
    if (indexOfUrl === -1) return content;

    if (indexOfUrl === content.length - fragment.length) {
        return content?.replace(fragment, '');
    } else {
        return content;
    }
}
