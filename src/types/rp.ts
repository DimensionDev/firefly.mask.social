export enum Theme {
    Mask = 'mask',
    GoldenFlower = 'golden-flower',
    LuckyFlower = 'lucky-flower',
    LuckyFirefly = 'lucky-firefly',
    CoBranding = 'co-branding',
}

export enum TokenType {
    Fungible = 'fungible',
    NonFungible = 'non-fungible',
}

export enum UsageType {
    Cover = 'cover',
    Payload = 'payload',
}

export enum BrandingType {
    Firefly = 'firefly',
}

export interface Dimension {
    width: number;
    height: number;
}
