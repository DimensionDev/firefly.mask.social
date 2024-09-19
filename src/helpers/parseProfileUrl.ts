import { Source } from '@/constants/enum.js';
import { isFollowCategory } from '@/helpers/isFollowCategory.js';
import { isSocialProfileCategory } from '@/helpers/isSocialProfileCategory.js';
import { isSocialSource } from '@/helpers/isSocialSource.js';
import { isWalletProfileCategory } from '@/helpers/isWalletProfileCategory.js';
import { resolveSourceFromUrlNoFallback } from '@/helpers/resolveSource.js';

export function parseProfileUrl({pathname}: URL) {
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
