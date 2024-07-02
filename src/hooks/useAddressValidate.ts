import { t } from '@lingui/macro';
import { NetworkPluginID } from '@masknet/shared-base';
import { useAddressType, useChainContext } from '@masknet/web3-hooks-base';
import { GoPlusLabs } from '@masknet/web3-providers';
import { AddressType } from '@masknet/web3-shared-evm';
import { useMemo } from 'react';
import { useAsync } from 'react-use';

interface AddressValidation {
    loading: boolean;
    validation: [boolean, string?];
}

export function useAddressValidate(address: string): AddressValidation {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>();
    const { value: addressType, loading } = useAddressType(NetworkPluginID.PLUGIN_EVM, address, {
        chainId,
    });
    const { value: security } = useAsync(async () => {
        return GoPlusLabs.getAddressSecurity(chainId, address);
    }, [chainId, address]);

    const isMaliciousAddress = security && Object.values(security).filter((x) => x === '1').length > 0;

    const validation: AddressValidation['validation'] = useMemo(() => {
        if (addressType === AddressType.Contract) return [false, t`Address is a contract address`];
        if (isMaliciousAddress) return [false, t`Address is a malicious address`];
        return [true];
    }, [addressType, isMaliciousAddress]);
    return {
        loading,
        validation,
    };
}
