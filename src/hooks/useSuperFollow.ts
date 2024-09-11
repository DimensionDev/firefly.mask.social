import { type FeeFollowModuleSettingsFragment, FollowModuleType } from '@lens-protocol/client';
import { useQuery } from '@tanstack/react-query';
import { type Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { Source } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useSuperFollowModule(profile: Profile, disabled = false) {
    const { data, isLoading } = useQuery({
        queryKey: ['original-profile', profile.profileId],
        staleTime: 1000 * 60 * 2,
        enabled: profile.source === Source.Lens && !disabled,
        queryFn: () =>
            lensSessionHolder.sdk.profile.fetch({
                forProfileId: profile.profileId,
            }),
    });

    const followModule = data?.followModule as FeeFollowModuleSettingsFragment | null;

    return {
        followModule: followModule?.__typename !== 'FeeFollowModuleSettings' ? null : followModule,
        loading: isLoading,
    };
}

export function useSuperFollowData(profile: Profile) {
    const account = useAccount();
    const currentProfile = useCurrentProfile(Source.Lens);

    const { followModule, loading: isProfileLoading } = useSuperFollowModule(profile);

    const followFee = parseFloat(followModule?.amount?.value || '0');
    const feeTokenAddress = followModule?.amount?.asset?.contract.address as Address;

    const {
        data: allowanceData,
        isLoading: isAllowanceLoading,
        refetch: refetchAllowance,
    } = useQuery({
        queryKey: ['approved', feeTokenAddress, profile.profileId],
        enabled: !!feeTokenAddress,
        queryFn: () =>
            lensSessionHolder.sdk.modules.approvedAllowanceAmount({
                currencies: [feeTokenAddress],
                followModules: [FollowModuleType.FeeFollowModule],
                openActionModules: [],
                referenceModules: [],
            }),
    });

    if (allowanceData && !allowanceData.isSuccess()) {
        throw new Error('Failed to fetch allowance data');
    }

    const allowanceModule = allowanceData?.unwrap()?.[0];

    const { data: balanceData, isLoading: isBalanceLoading } = useReadContract({
        abi: erc20Abi,
        address: feeTokenAddress,
        functionName: 'balanceOf',
        args: [account.address!],
        chainId: followModule?.amount?.asset?.contract.chainId,
    });

    return {
        address: currentProfile?.ownedBy?.address as Address,
        loading: isProfileLoading || isAllowanceLoading || isBalanceLoading,
        followModule,
        isConnected: account.isConnected,
        allowanceModule,
        hasAmount:
            !!balanceData &&
            parseFloat(formatUnits(balanceData, followModule?.amount?.asset?.decimals as number)) > followFee,
        hasAllowance: parseFloat(allowanceModule?.allowance.value || '0') > followFee,
        refetchAllowance,
    };
}
