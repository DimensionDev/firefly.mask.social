export function getPostPayload(raw: string | undefined): [string, '1' | '2'] | undefined {
    const matched = raw?.match(/(?:.*)PostData_(v1|v2)=(.*)/);
    if (!matched) return;

    const [, version, payload] = matched;

    if (version === 'v1') return [payload, '1'];
    if (version === 'v2') return [payload, '2'];
    return;
}
