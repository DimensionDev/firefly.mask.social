import { isSameAddress } from '@masknet/web3-shared-base';
import { ChainId, type NetworkType } from '@masknet/web3-shared-evm';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { compact, first } from 'lodash-es';
import { useCallback } from 'react';

import { EMPTY_LIST } from '@/constants/index.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { EVMNetworkResolver } from '@/mask/bindings/index.js';
import { useAvailability } from '@/mask/plugins/red-packet/hooks/useAvailability.js';
import { useCheckSponsorableGasFee } from '@/mask/plugins/red-packet/hooks/useCheckSponsorableGasFee.js';
import { useClaimStrategyStatus } from '@/mask/plugins/red-packet/hooks/useClaimStrategyStatus.js';
import { useParseRedPacket } from '@/mask/plugins/red-packet/hooks/useParseRedPacket.js';
import { useSignedMessage } from '@/mask/plugins/red-packet/hooks/useSignedMessage.js';
import { type RedPacketJSONPayload, RedPacketStatus } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(payload: RedPacketJSONPayload, post: Post) {
    const parsedChainId =
        payload.token?.chainId ??
        EVMNetworkResolver.networkChainId((payload.network ?? '') as NetworkType) ??
        ChainId.Mainnet;

    const { account } = useChainContext({
        chainId: parsedChainId,
    });

    const { data: availability, refetch: recheckAvailability } = useAvailability(
        payload.rpid,
        payload.contract_version,
        {
            account,
            chainId: parsedChainId,
        },
    );

    const image = first(
        compact(
            post.metadata.content?.attachments
                ?.filter((x) => x.type === 'Image')
                .map((x) => x.uri)
                .filter(Boolean) ?? EMPTY_LIST,
        ),
    );
    const parsed = useParseRedPacket(parsedChainId, post.source, image);

    const checkAvailability = recheckAvailability as (
        options?: RefetchOptions,
    ) => Promise<QueryObserverResult<typeof availability>>;

    const { data: password } = useSignedMessage(account, payload, post.source);

    const { data, refetch, isFetching, isLoading } = useClaimStrategyStatus(payload, post.source);

    const recheckClaimStatus = useCallback(async () => {
        const { data } = await refetch();
        return data?.data?.canClaim;
    }, [refetch]);

    const { data: isSponsorable = false } = useCheckSponsorableGasFee(parsedChainId, account);

    if (!availability || (!payload.password && !data))
        return {
            parsedChainId,
            isEmpty: false,
            isClaimed: false,
            isExpired: false,
            isSponsorable,
            availability,
            checkAvailability,
            payload,
            claimStrategyStatus: null,
            checkingClaimStatus: isFetching,
            recheckClaimStatus,
            password,
            checkStrategyData: {
                data,
                refetch,
                isFetching,
                isLoading,
            },
            computed: {
                canClaim: !!data?.data?.canClaim,
                canRefund: false,
                listOfStatus: EMPTY_LIST as RedPacketStatus[],
            },
        };
    const isEmpty = availability.balance === '0';
    const isExpired = availability.expired;
    const isClaimed = parsed?.redpacket?.isClaimed || availability.claimed_amount !== '0';
    const isRefunded = isEmpty && availability.claimed < availability.total;
    const isCreator = isSameAddress(payload?.sender.address ?? '', account);
    const isPasswordValid = !!(password && password !== 'PASSWORD INVALID');
    // For a central RedPacket, we don't need to check about if the password is valid
    const canClaimByContract = !isExpired && !isEmpty && !isClaimed;
    const canClaim = payload.password ? canClaimByContract && isPasswordValid : canClaimByContract;

    return {
        parsedChainId,
        isClaimed,
        isEmpty,
        isSponsorable,
        isExpired,
        availability,
        checkAvailability,
        claimStrategyStatus: data?.data,
        recheckClaimStatus,
        checkingClaimStatus: isFetching,
        password,
        computed: {
            canClaim,
            canRefund: isExpired && !isEmpty && isCreator,
            canSend: !isEmpty && !isExpired && !isRefunded && isCreator,
            isPasswordValid,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    };
}
