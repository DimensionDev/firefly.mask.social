import { useMemo, useState } from 'react';
import { useEstimateFeesPerGas } from 'wagmi';

import { multipliedBy, ZERO } from '@/helpers/number.js';
import { EVMChainResolver } from '@/mask/index.js';
import { MintButton } from '@/modals/FreeMintModal/MintButton.js';
import { MintParamsPanel } from '@/modals/FreeMintModal/MintParamsPanel.js';
import type { MintMetadata, SponsorMintOptions } from '@/providers/types/Firefly.js';

interface MintModalContentProps {
    mintTarget: SponsorMintOptions;
    mintParams: MintMetadata;
    onSuccess?: () => void;
}

export function MintModalContent({ mintTarget, mintParams, onSuccess }: MintModalContentProps) {
    const [count, setCount] = useState<number | ''>(1);

    const isEIP1559 = EVMChainResolver.isFeatureSupported(mintParams.chainId, 'EIP1559');
    const { data, isLoading, isRefetching } = useEstimateFeesPerGas({
        chainId: mintParams.chainId,
        type: isEIP1559 ? 'eip1559' : 'legacy',
    });

    const gasLimit = mintParams.txData.gasLimit || '0';
    const gasFee = useMemo(() => {
        return isEIP1559
            ? !data?.maxFeePerGas
                ? ZERO
                : multipliedBy(data.maxFeePerGas.toString(), gasLimit)
            : !data?.gasPrice
              ? ZERO
              : multipliedBy(data.gasPrice.toString(), gasLimit);
    }, [gasLimit, data?.maxFeePerGas, data?.gasPrice, isEIP1559]);

    const loading = isLoading || isRefetching;

    return (
        <>
            <MintParamsPanel
                className="mt-6"
                mintParams={mintParams}
                mintCount={count || 1}
                gasFee={gasFee}
                isLoading={loading}
            />
            <MintButton
                mintTarget={mintTarget}
                mintParams={mintParams}
                count={count}
                gasFee={gasFee}
                isLoading={loading}
                onCountChange={setCount}
                onSuccess={onSuccess}
            />
        </>
    );
}
