export function resolveSearchKeyword(input: string) {
    if (!input) {
        return {
            handle: null,
            content: '',
        };
    }

    const trimmedInput = input.trim();

    if (!trimmedInput.startsWith('from:')) {
        return {
            handle: null,
            content: trimmedInput,
        };
    }
    const regex = /^from:\s*(\S+?)(?:\s+(.*))?$/;
    const match = trimmedInput.match(regex);

    if (match) {
        const handle = match[1];
        const searchContent = match[2] || '';

        return {
            handle,
            content: searchContent.trim(),
        };
    }

    return {
        handle: null,
        content: trimmedInput,
    };
}
