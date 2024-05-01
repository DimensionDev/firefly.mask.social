export function getDetailedErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return `${error}`;
    const lines = [error.message];
    if (error.stack) lines.push(error.stack);
    lines.push('');
    return lines.join('\n').trim();
}
