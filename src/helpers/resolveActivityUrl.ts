import urlcat from 'urlcat';

export enum ReferralAccountPlatform {
    X = 'x',
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
