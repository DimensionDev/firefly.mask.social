export interface OpenGraphImage {
    url: string;
    width?: number;
    height?: number;
}

export interface OpenGraph {
    type: 'website';
    title: string;
    description?: string;
    url: string;
    images?: OpenGraphImage[];
    locale?: string;
}

export interface Payload {
    type: 'lens' | 'farcaster' | 'mirror' | 'snapshot' | 'nft';
}

export interface LinkDigest {
    og: OpenGraph;
    payload?: Payload;
}

export function digestLink(link: string): Promise<LinkDigest> {
    // Learn more:
    // https://www.notion.so/mask/v2-misc-linkDigest-1ef6c3e5754d487fb67544f80e03de05
    throw new Error('Not implemented');
}
