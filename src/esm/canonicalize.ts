import serialize from 'canonicalize';

export const canonicalize = serialize as unknown as typeof serialize.default;
