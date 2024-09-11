import { type ProfileCategory, WalletProfileTabType } from '@/constants/enum.js';

export function isWalletProfileCategory(category: ProfileCategory): category is WalletProfileTabType {
    return [
        WalletProfileTabType.OnChainActivities,
        WalletProfileTabType.NFTs,
        WalletProfileTabType.POAPs,
        WalletProfileTabType.Articles,
    ].includes(category as WalletProfileTabType);
}
