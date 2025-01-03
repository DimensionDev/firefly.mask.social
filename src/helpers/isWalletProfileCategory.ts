import { WalletProfileCategory } from '@/constants/enum.js';

export function isWalletProfileCategory(category: string): category is WalletProfileCategory {
    return [
        WalletProfileCategory.Activities,
        WalletProfileCategory.NFTs,
        WalletProfileCategory.POAPs,
        WalletProfileCategory.Articles,
        WalletProfileCategory.DAOs,
    ].includes(category as WalletProfileCategory);
}
