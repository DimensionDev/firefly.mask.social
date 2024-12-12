'use client';

import { t, Trans } from '@lingui/macro';
import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import urlcat from 'urlcat';
import { useInterval } from 'usehooks-ts';
import type { Address } from 'viem';

import HourGlassIcon from '@/assets/hourglass.svg';
import RedPacketIcon from '@/assets/red-packet.svg';
import { ClickableArea } from '@/components/ClickableArea.js';
import { RedpacketCardFooter } from '@/components/RedPacket/RedpacketCardFooter.js';
import { RequirementsModal } from '@/components/RedPacket/RequirementsModal.js';
import { SITE_URL } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { createPublicViemClient } from '@/helpers/createPublicViemClient.js';
import { getTimeLeft } from '@/helpers/formatTimestamp.js';
import { getPostUrl } from '@/helpers/getPostUrl.js';
import { ZERO } from '@/helpers/number.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { useAvailableBalance } from '@/hooks/useAvailableBalance.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { useRefundCallback } from '@/hooks/useRefundCallback.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { useAvailabilityComputed } from '@/mask/plugins/red-packet/hooks/useAvailabilityComputed.js';
import { useRedPacketCover } from '@/mask/plugins/red-packet/hooks/useRedPacketCover.js';
import { ComposeModalRef } from '@/modals/controls.js';
import { type RedPacketJSONPayload, RedPacketStatus } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

function Timer({ endTime }: { endTime: number }) {
    const [now, setNow] = useState(Date.now());

    const timeLeft = getTimeLeft(endTime, now);

    const isExpire = dayjs(now).isAfter(endTime);

    useInterval(
        () => {
            setNow(Date.now());
        },
        !isExpire ? 1000 : null,
    );
    if (isExpire) return null;
    return (
        <div className="flex w-[146px] items-center justify-center gap-[6px] rounded-full bg-[#E8E8FF] px-[13px] py-[7px] opacity-75 backdrop-blur-[5px]">
            <HourGlassIcon width={12} height={12} />
            <span className="flex-1 text-xs leading-4">
                <Trans>
                    {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m {timeLeft?.seconds}s
                </Trans>
            </span>
        </div>
    );
}

interface Props {
    payload: RedPacketJSONPayload;
    post: Post;
}

export function RedpacketCard({ payload, post }: Props) {
    const [requirementOpen, setRequirementOpen] = useState(false);

    // #region token detailed
    const {
        isSponsorable,
        parsedChainId,
        availability,
        password,
        isExpired,
        computed: { canClaim, canRefund, listOfStatus },
        isEmpty,
        isClaimed,
    } = useAvailabilityComputed(payload, post);
    // #endregion

    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(parsedChainId);

    const { account } = useChainContext();
    // RedPacket created from Mask has no cover settings
    const cover = useRedPacketCover(payload, availability);

    const { value: estimateGas = ZERO, loading: estimateLoading } = useAsync(async () => {
        if (!canClaim || !parsedChainId || !password || !account) return;

        const client = createPublicViemClient(parsedChainId);

        return runInSafeAsync(async () => {
            return client.estimateContractGas({
                abi: HappyRedPacketV4ABI,
                functionName: 'claim',
                args: [payload.rpid, password, account],
                address: redpacketContractAddress as Address,
                account: account as Address,
            });
        });
    }, [account, canClaim, parsedChainId, redpacketContractAddress, payload.rpid, password]);

    const nativeToken = useMemo(() => EVMChainResolver.nativeCurrency(parsedChainId), [parsedChainId]);

    const balanceResult = useAvailableBalance(
        nativeToken.address as Address,
        new BigNumber(estimateGas.toString()).toNumber(),
        {
            chainId: parsedChainId,
        },
    );

    const { value: balance = 0 } = balanceResult ?? {};

    const handleShare = useCallback(async () => {
        const postUrl = urlcat(SITE_URL, getPostUrl(post));
        ComposeModalRef.open({
            type: 'compose',

            chars: [
                isClaimed
                    ? t`🤑 Check this #FireflyLuckyDrop 🧧💰✨ on ${postUrl} !`
                    : t`🤑 Just claimed a #FireflyLuckyDrop 🧧💰✨ on ${postUrl} !`,
                ' \n\n Grow your followers and engagement with Lucky Drop on Firefly!',
            ],
        });
    }, [post, isClaimed]);

    const [{ loading: refundLoading }, refund] = useRefundCallback(payload.rpid, { chainId: parsedChainId });

    return (
        <div
            className="my-2 min-h-[438px] rounded-2xl p-3 text-lightTextMain"
            style={{
                background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-[6px]">
                    <RedPacketIcon width={24} height={24} />
                    <strong className="text-base leading-[20px]">
                        <Trans>Lucky Drop</Trans>
                    </strong>
                </div>
                <Timer endTime={payload.creation_time + payload.duration * 1000} />
            </div>

            <div
                className="relative my-3 w-full rounded-[18px]"
                style={
                    cover
                        ? {
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundImage: `url(${cover.backgroundImageUrl})`,
                              backgroundColor: cover.backgroundColor,
                              aspectRatio: '10 / 7',
                          }
                        : undefined
                }
            >
                {isSponsorable ? (
                    <Image
                        alt="gasless"
                        arial-label="gasless"
                        src="/image/gasless.png"
                        className="absolute left-0 top-0 h-[48px] w-[48px] rounded-tl-[18px]"
                        width={48}
                        height={48}
                    />
                ) : null}
                {listOfStatus.length ? (
                    <ClickableArea
                        className="absolute right-5 top-4 z-20 flex cursor-pointer items-center rounded-full px-3 py-[6px] text-xs leading-3 text-white"
                        style={{ background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(5px)' }}
                        onClick={() => setRequirementOpen(true)}
                    >
                        <span>{resolveRedPacketStatus(listOfStatus)}</span>
                    </ClickableArea>
                ) : null}
                {cover ? <Image alt="cover" fill src={cover.url!} /> : null}
            </div>

            {cover ? (
                <RedpacketCardFooter
                    post={post}
                    payload={payload}
                    isClaimed={isClaimed}
                    isEmpty={isEmpty}
                    isExpired={isExpired}
                    canRefund={canRefund}
                    handleShare={handleShare}
                    handleRefund={refund}
                    refundLoading={refundLoading}
                    canClaim={canClaim}
                    balance={balance}
                    estimateLoading={estimateLoading}
                    handleClaim={() => setRequirementOpen(true)}
                />
            ) : null}

            {requirementOpen ? (
                <RequirementsModal
                    open
                    onClose={() => setRequirementOpen(false)}
                    payload={payload}
                    post={post}
                    showResults={listOfStatus.length === 0}
                />
            ) : null}
        </div>
    );
}

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed';
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded';
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired';
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty';
    return '';
}
