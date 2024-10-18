import { WalletProfileCategory } from '@/constants/enum.js';

export function isWalletProfileCategory(category: string): category is WalletProfileCategory {
    return [
        WalletProfileCategory.OnChainActivities,
        WalletProfileCategory.NFTs,
        WalletProfileCategory.POAPs,
        WalletProfileCategory.Articles,
        WalletProfileCategory.DAO,
    ].includes(category as WalletProfileCategory);
}
