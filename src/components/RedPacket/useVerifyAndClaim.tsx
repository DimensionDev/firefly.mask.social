import { t, Trans } from '@lingui/macro';
import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { last } from 'lodash-es';
import { useCallback } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';

import CircleSuccessIcon from '@/assets/circle-success.svg';
import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import type { SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { useClaimCallback } from '@/mask/plugins/red-packet/hooks/useClaimCallback.js';
import { useClaimStrategyStatus } from '@/mask/plugins/red-packet/hooks/useClaimStrategyStatus.js';
import { useCurrentClaimProfile } from '@/mask/plugins/red-packet/hooks/useCurrentClaimProfile.js';
import { ConfirmModalRef } from '@/modals/controls.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import type { RedPacketJSONPayload } from '@/providers/red-packet/types.js';

export function useVerifyAndClaim(payload: RedPacketJSONPayload, source: SocialSource) {
    const account = useAccount().address;
    const { data, isFetching, refetch: recheckClaimStatus } = useClaimStrategyStatus(payload, source);

    const { data: currentClaimProfile } = useCurrentClaimProfile(source);
    const [{ loading: isClaiming }, claimCallback] = useClaimCallback(account ?? '', payload, source);
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(payload.chainId);

    const verifyAndClaim = useCallback(async () => {
        const { data, error } = await recheckClaimStatus();
        if (error) {
            enqueueErrorMessage(t`Oops... Network issue. Please try again`);
            return false;
        }
        if (!data?.data.canClaim) {
            enqueueErrorMessage(t`Oops... Network issue. Please try again`);
            return false;
        }

        const hash = await claimCallback();
        if (hash && currentClaimProfile?.profileId && currentClaimProfile.handle) {
            await FireflyRedPacket.finishClaiming(
                payload.rpid,
                currentClaimProfile.platform,
                currentClaimProfile.profileId,
                currentClaimProfile?.handle,
                hash,
            );
        }

        await queryClient.refetchQueries({
            queryKey: ['red-packet', 'claim', payload.rpid],
        });

        const availability = (await readContract(config, {
            abi: HappyRedPacketV4ABI,
            functionName: 'check_availability',
            address: redpacketContractAddress as Address,
            args: [payload.rpid],
            account: account as Address,
        })) as [string, bigint, bigint, bigint, boolean, bigint];

        const claimed_amount = last(availability) as bigint;

        const amount = formatBalance(claimed_amount.toString(), payload.token?.decimals, { significant: 2 });
        ConfirmModalRef.open({
            title: t`Lucky Drop`,
            content: (
                <div className="flex h-[276px] w-[388px] flex-col items-center">
                    <CircleSuccessIcon width={90} height={90} />
                    <div className="mt-3 text-xl font-bold leading-6 text-success">
                        <Trans>Congratulations!</Trans>
                    </div>
                    <div className="mt-10 text-base font-bold leading-5 text-main">
                        <Trans>
                            Your claimed {amount} {payload.token?.symbol}.
                        </Trans>
                    </div>
                </div>
            ),
            modalClass: 'md:w-auto',
            enableConfirmButton: true,
            variant: 'normal',
            confirmButtonText: t`Share`,
        });

        enqueueSuccessMessage(t`Claimed lucky drop with ${amount} ${payload.token?.symbol} successfully`);
        return true;
    }, [
        account,
        claimCallback,
        currentClaimProfile?.handle,
        currentClaimProfile?.platform,
        currentClaimProfile?.profileId,
        payload.rpid,
        payload.token?.decimals,
        payload.token?.symbol,
        recheckClaimStatus,
        redpacketContractAddress,
    ]);

    return [
        {
            isVerifying: isFetching,
            isClaiming,
            claimStrategyStatus: data?.data.claimStrategyStatus,
        },
        verifyAndClaim,
    ] as const;
}