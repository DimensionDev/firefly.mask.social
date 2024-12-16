export function resolveSearchKeyword(input: string) {
    const regex = /from:\s*(\S+)\s*(.*)/;
    const match = input.match(regex);

    if (match) {
        const handle = match[1];
        const searchContent = match[2];

        return {
            handle,
            content: searchContent || '',
        };
    }

    return {
        handle: null,
        content: input.trim(),
    };
}
