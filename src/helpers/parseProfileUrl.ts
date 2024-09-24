import { Source } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isSocialProfileCategory } from '@/helpers/isSocialProfileCategory.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { isWalletProfileCategory } from '@/helpers/isWalletProfileCategory.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';
import { isProfilePageSource } from '@/helpers/isProfilePageSource.js';

export function parseProfileUrl(pathname: string) {
    if (!pathname.startsWith('/profile')) return null;
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
    if (!url.pathname.startsWith('/profile')) return null;
    const source = resolveSourceFromUrlNoFallback(url.searchParams.get('source'));
    if (!source || !isProfilePageSource(source)) return null;
    const [, , id, ...end] = url.pathname.split('/');
    if (end.length) return null;
    if (!id) return null;
    return { source, id };
}
