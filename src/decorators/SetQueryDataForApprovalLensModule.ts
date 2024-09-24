import type { ApprovedAllowanceAmountResultFragment } from '@lens-protocol/client';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { ClassType } from '@/types/index.js';

type Provider = typeof LensSocialMediaProvider;

const METHODS_BE_OVERRIDDEN = ['approveModuleAllowance'] as const;

export function SetQueryDataForApprovalLensModule<T extends ClassType<Provider>>(target: T): T {
    function overrideMethod<K extends (typeof METHODS_BE_OVERRIDDEN)[number]>(key: K) {
        const method = target.prototype[key] as Provider[K];

        Object.defineProperty(target.prototype, key, {
            value: async (...args: Parameters<Provider[K]>) => {
                const m = method as (...args: Parameters<Provider[K]>) => Promise<void>;
                const result = await m.apply(target.prototype, args);

                const currentProfile = getCurrentProfile(Source.Lens);
                const contract = args[2] ?? args[0].allowance.asset.contract.address;
                queryClient.setQueryData(
                    ['approved', contract, currentProfile?.profileId],
                    (
                        old:
                            | { allowanceData: ApprovedAllowanceAmountResultFragment[]; hasAllowance: boolean }
                            | undefined,
                    ) => {
                        if (
                            isSameEthereumAddress(contract, old?.allowanceData?.[0]?.allowance?.asset.contract.address)
                        ) {
                            return {
                                ...old,
                                hasAllowance: true,
                            };
                        }

                        return old;
                    },
                );

                return result;
            },
        });
    }

    METHODS_BE_OVERRIDDEN.forEach(overrideMethod);

    return target;
}
