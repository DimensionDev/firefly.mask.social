import { type ApprovedAllowanceAmountResultFragment, OpenActionModuleType } from '@lens-protocol/client';
import { useAsyncFn } from 'react-use';
import type { Address, Hex } from 'viem';
import { useChainId, useSendTransaction, useSwitchChain } from 'wagmi';
import { polygon } from 'wagmi/chains';

import { getLensAllowanceModule } from '@/helpers/getLensAllowanceModule.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';

export function useAllowanceForLensModule() {
    const chainId = useChainId();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();

    return useAsyncFn(
        async (module: ApprovedAllowanceAmountResultFragment, amount: string) => {
            const moduleName = module.moduleName;
            const contract = module.allowance.asset.contract.address;
            const isUnknownModule = moduleName === OpenActionModuleType.UnknownOpenActionModule;
            const fieldKey = isUnknownModule ? 'unknownOpenActionModule' : getLensAllowanceModule(moduleName).field;

            const data = await lensSessionHolder.sdk.modules.generateCurrencyApprovalData({
                allowance: { currency: contract, value: amount },
                module: {
                    [fieldKey]: isUnknownModule ? module.moduleContract.address : moduleName,
                },
            });

            if (!data?.isSuccess()) {
                throw new Error('Failed to generate approval data');
            }

            if (chainId !== polygon.id) {
                await switchChainAsync({ chainId: polygon.id });
            }

            const approvalData = data.unwrap();
            const hash = await sendTransactionAsync({
                account: approvalData.from as Address,
                data: approvalData.data as Hex,
                to: approvalData.to as Address,
            });

            await waitForEthereumTransaction(chainId, hash);
        },
        [chainId, switchChainAsync, sendTransactionAsync],
    );
}
