export function trimify(value: string) {
    return value.replace(/\n\n\s*\n/g, '\n\n').trim();
}
