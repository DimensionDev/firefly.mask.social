import type { Metadata } from 'next';

export function createSiteMetadata(metadata?: Partial<Metadata>) {
    return {
        title: 'Mask Social',
        description: 'The Mask Social Website.',
        ...metadata,
    } satisfies Metadata;
}
