export function removeAtEnd(content: string, fragment: string): string {
    if (fragment && content) {
        content = content.trimEnd();
        const indexOfUrl = content.indexOf(fragment);
        if (indexOfUrl === content.length - fragment.length) {
            return content?.replace(fragment, '');
        } else {
            return content;
        }
    } else {
        return content ?? '';
    }
}
