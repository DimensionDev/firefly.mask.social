import { PageRoute, Source } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';
import { isSocialProfileCategory } from '@/helpers/isSocialProfileCategory.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { isWalletProfileCategory } from '@/helpers/isWalletProfileCategory.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseProfileUrl(pathname: string) {
    if (!pathname.startsWith(PageRoute.Profile)) return null;
    const [, , sourceInUrl, id, category] = pathname.split('/');
    const source = resolveSourceFromUrlNoFallback(sourceInUrl);
    if (!source) return null;
    const isSocialProfile = isSocialSource(source) && isSocialProfileCategory(source, category);
    const isWalletProfile = source === Source.Wallet && isWalletProfileCategory(category);
    const isProfileFollowPage = isSocialSource(source) && isFollowCategory(category);
    if (isSocialProfile || isWalletProfile || isProfileFollowPage) {
        return isSocialProfile || isWalletProfile || isProfileFollowPage
            ? {
                  id,
                  category,
                  source,
              }
            : null;
    }
    return null;
}

export function parseOldProfileUrl(url: URL) {
    if (!url.pathname.startsWith(PageRoute.Profile)) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isProfilePageSource(source)) return null;
    const [, , id, ...end] = url.pathname.split('/');
    if (end.length) return null;
    if (!id) return null;

    if (source === Source.Wallet) {
        const walletTab = url.searchParams.get('wallet_tab');
        if (!walletTab || !isWalletProfileCategory(walletTab)) return { source, id };
        return { source, id, category: walletTab };
    }

    const category = url.searchParams.get('profile_tab');
    if (!category || !isSocialProfileCategory(source, category)) return { source, id };

    return { source, id, category };
}
