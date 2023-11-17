import type { Metadata } from 'next';

export function createSiteMetadata() {
    return {
        title: 'Mask Social',
        description: 'The Mask Social Website.',
    } satisfies Metadata;
}
