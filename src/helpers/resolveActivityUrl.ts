import urlcat from 'urlcat';

export enum ReferralAccountPlatform {
    X = 'x',
    Farcaster = 'f',
    Lens = 'l',
}

export function resolveActivityUrl(
    name: string,
    options?: {
        platform?: ReferralAccountPlatform;
        referralCode?: string;
    },
) {
    return urlcat('/event/:name', {
        name,
        p: options?.platform,
        r: options?.referralCode,
    });
}
