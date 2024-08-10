export function getDetailedErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return `${error}`;
    const lines = error.stack ? [error.stack] : [error.message];
    lines.push('');
    return lines.join('\n').trim();
}
