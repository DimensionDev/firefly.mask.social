/* eslint-disable no-irregular-whitespace */
import { Plural, select, t, Trans } from '@lingui/macro';
import { delay } from '@masknet/kit';
import { useLastRecognizedIdentity, usePostInfoDetails, usePostLink } from '@masknet/plugin-infra/content-script';
import { LoadingStatus, TransactionConfirmModal } from '@masknet/shared';
import { EMPTY_LIST } from '@masknet/shared-base';
import { formatBalance, isZero, TokenType } from '@masknet/web3-shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { Card, Grow, Stack, Typography } from '@mui/material';
import { memo, useCallback, useMemo, useState } from 'react';
import parseColor from 'tinycolor2';

import type { SocialSource } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { Image } from '@/esm/Image.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import type { HappyRedPacketV4 } from '@/mask/bindings/constants.js';
import { EVMChainResolver, makeStyles } from '@/mask/bindings/index.js';
import { OperationFooter } from '@/mask/plugins/red-packet/components/RedPacket/OperationFooter.js';
import { RequestLoginFooter } from '@/mask/plugins/red-packet/components/RedPacket/RequestLoginFooter.js';
import { Requirements } from '@/mask/plugins/red-packet/components/Requirements/index.js';
import { useAvailabilityComputed } from '@/mask/plugins/red-packet/hooks/useAvailabilityComputed.js';
import { useClaimCallback } from '@/mask/plugins/red-packet/hooks/useClaimCallback.js';
import { useRedPacketContract } from '@/mask/plugins/red-packet/hooks/useRedPacketContract.js';
import { useRedPacketCover } from '@/mask/plugins/red-packet/hooks/useRedPacketCover.js';
import { useRefundCallback } from '@/mask/plugins/red-packet/hooks/useRefundCallback.js';
import { ComposeModalRef, LoginModalRef } from '@/modals/controls.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';
import { type FireflyRedPacketAPI, type RedPacketJSONPayload, RedPacketStatus } from '@/providers/red-packet/types.js';
import type { Post } from '@/providers/types/SocialMedia.js';

async function share(text: string, source?: SocialSource) {
    TransactionConfirmModal.close();
    await delay(300);
    ComposeModalRef.open({
        chars: text.replaceAll(/mask\.io/gi, SITE_URL),
        source,
    });
}

const useStyles = makeStyles<{ outdated: boolean }>()((theme, { outdated }) => {
    return {
        root: {
            borderRadius: theme.spacing(2),
            padding: theme.spacing(1.5, 2),
            position: 'relative',
            display: 'flex',
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            color: theme.palette.common.white,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginBottom: outdated ? '12px' : 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
            width: 'calc(100% - 32px)',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                width: 'calc(100% - 20px)',
            },
        },
        fireflyRoot: {
            aspectRatio: '10 / 7',
        },
        maskRoot: {
            marginTop: 'auto',
            height: 335,
            backgroundImage: `url(${new URL('@/mask/plugins/red-packet/assets/cover.png', import.meta.url)})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        },
        cover: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            inset: 0,
            margin: 'auto',
            zIndex: 0,
        },
        requirements: {
            width: 407,
            height: 'fit-content',
            boxSizing: 'border-box',
            position: 'absolute',
            zIndex: 9,
            inset: 0,
            margin: 'auto',
            [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
                width: 'auto',
            },
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },

        content: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        bottomContent: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
        myStatus: {
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.8,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                left: 12,
                bottom: 8,
            },
        },
        from: {
            fontSize: '14px',
            color: theme.palette.common.white,
            alignSelf: 'end',
            fontWeight: 500,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                right: 12,
                bottom: 8,
            },
        },
        label: {
            width: 76,
            height: 27,
            display: 'flex',
            justifyContent: 'center',
            fontSize: 12,
            alignItems: 'center',
            borderRadius: theme.spacing(1),
            backgroundColor: parseColor(theme.palette.common.black).setAlpha(0.5).toString(),
            textTransform: 'capitalize',
            position: 'absolute',
            right: 12,
            top: 12,
        },
        words: {
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.common.white,
            fontSize: 24,
            fontWeight: 700,
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
            },
        },
        messageBox: {
            width: '100%',
        },
        tokenLabel: {
            width: 48,
            height: 48,
            position: 'absolute',
            top: 0,
            left: 0,
        },
    };
});

export interface RedPacketProps {
    payload: RedPacketJSONPayload;
    post: Post;
}

export const RedPacket = memo(function RedPacket({ payload, post }: RedPacketProps) {
    const token = payload.token;
    const payloadChainId = token?.chainId ?? EVMChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet;
    const { account } = useChainContext();

    // #region token detailed
    const {
        availability,
        computed: availabilityComputed,
        checkAvailability,
        claimStrategyStatus,
        recheckClaimStatus,
        checkingClaimStatus,
    } = useAvailabilityComputed(payload, post);

    // #endregion

    const { canClaim, canRefund, listOfStatus } = availabilityComputed;

    // #region remote controlled transaction dialog
    const postLink = usePostLink();

    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(
        account,
        payload,
        post.source,
    );
    const source = usePostInfoDetails.source() as SocialSource | null;
    const platform = source?.toLowerCase() as 'lens' | 'farcaster' | 'twitter';
    const postUrl = usePostInfoDetails.url();
    const handle = usePostInfoDetails.handle();
    const link = postLink.toString() || postUrl?.toString();

    const getShareText = useCallback(
        (hasClaimed: boolean) => {
            const sender = handle ?? '';
            const farcaster_lens_claimed = t`🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @${sender} !

Claim on Lens: ${link}`;
            const notClaimed = t`🤑 Check this Lucky Drop  🧧💰✨ sent by @${sender}.

Grow your followers and engagement with Lucky Drop on Firefly mobile app or https://firefly.mask.social !
`;
            return select(platform, {
                farcaster: hasClaimed ? farcaster_lens_claimed : notClaimed + '\n' + t`Claim on Farcaster: ${link}`,
                lens: hasClaimed ? farcaster_lens_claimed : notClaimed + '\n' + t`Claim on Lens: ${link}`,
                twitter: notClaimed + '\n' + t`Claim on: ${link}`,
                other: notClaimed + '\n' + t`Claim on: ${link}`,
            });
        },
        [link, platform, handle],
    );

    const claimedShareText = useMemo(() => getShareText(true), [getShareText]);
    const shareText = useMemo(() => {
        const hasClaimed = listOfStatus.includes(RedPacketStatus.claimed) || claimTxHash;
        return getShareText(!!hasClaimed);
    }, [getShareText, listOfStatus, claimTxHash]);

    const [{ loading: isRefunding }, _isRefunded, refundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payloadChainId,
    );

    const redPacketContract = useRedPacketContract(payloadChainId, payload.contract_version) as HappyRedPacketV4;
    const checkResult = useCallback(async () => {
        const data = await redPacketContract.methods.check_availability(payload.rpid).call({
            // check availability is ok w/o account
            from: account,
        });
        if (isZero(data.claimed_amount)) return;
        TransactionConfirmModal.open({
            shareText: claimedShareText,
            amount: formatBalance(data.claimed_amount, token?.decimals, { significant: 2 }),
            token,
            tokenType: TokenType.Fungible,
            messageTextForNFT: t`1 NFT claimed.`,
            messageTextForFT: t`You claimed ${formatBalance(data.claimed_amount, token?.decimals, { significant: 2 })} $${token?.symbol}.`,
            title: t`Lucky Drop`,
            share: (text) => share?.(text, source ? source : undefined),
        });
    }, [token, redPacketContract, payload.rpid, account, claimedShareText, source]);

    const [showRequirements, setShowRequirements] = useState(false);
    const me = useLastRecognizedIdentity();
    const myProfileId = me?.profileId;
    const myHandle = me?.identifier?.userId;
    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined;
        if (canClaim) {
            const result = await recheckClaimStatus();
            setShowRequirements(result === false);
            if (result === false) return;
            hash = await claimCallback();
            if (platform && myProfileId && myHandle && hash) {
                await FireflyRedPacket.finishClaiming(
                    payload.rpid,
                    platform as FireflyRedPacketAPI.PlatformType,
                    myProfileId,
                    myHandle,
                    hash,
                );
            }
            checkResult();
        } else if (canRefund) {
            hash = await refundCallback();
        }
        if (typeof hash === 'string') {
            checkAvailability();
        }
    }, [
        canClaim,
        canRefund,
        recheckClaimStatus,
        claimCallback,
        platform,
        myProfileId,
        myHandle,
        checkResult,
        payload.rpid,
        refundCallback,
        checkAvailability,
    ]);

    const myStatus = useMemo(() => {
        if (!availability) return '';
        if (token && listOfStatus.includes(RedPacketStatus.claimed))
            return t`You got ${availability.claimed_amount ? formatBalance(availability.claimed_amount, token.decimals, { significant: 2 }) : ''} ${availability.claimed_amount ? token.symbol : '-'}`;
        return '';
    }, [availability, token, listOfStatus]);

    const subtitle = useMemo(() => {
        if (!availability || !token) return;

        if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
            return t`You could refund ${formatBalance(availability.balance, token.decimals, { significant: 2 })} ${token.symbol ?? '-'}.`;
        if (listOfStatus.includes(RedPacketStatus.refunded)) return t`The Lucky Drop has been refunded.`;
        if (listOfStatus.includes(RedPacketStatus.expired)) return t`The Lucky Drop is expired.`;
        if (listOfStatus.includes(RedPacketStatus.empty)) return t`The Lucky Drop is empty.`;
        if (!payload.password) return t`The Lucky Drop is broken.`;
        const total = formatBalance(payload.total, token.decimals, { significant: 2 });
        const symbol = token.symbol ?? '-';
        return (
            <Trans>
                {payload.shares} <Plural value={payload.shares} one="share" other="shares" /> / {total} ${symbol}
            </Trans>
        );
    }, [availability, canRefund, token, payload, listOfStatus]);

    const handleShare = async () => {
        if (!shareText) return;
        await share(shareText.replaceAll(/mask\.io/gi, SITE_URL), source ? source : undefined);
    };

    const isEmpty = listOfStatus.includes(RedPacketStatus.empty);
    const outdated = isEmpty || (!canRefund && listOfStatus.includes(RedPacketStatus.expired));

    const { classes, cx } = useStyles({ outdated });

    // RedPacket created from Mask has no cover settings
    const cover = useRedPacketCover(payload, availability);

    // the red packet can fetch without account
    if (!availability || !token) return <LoadingStatus minHeight={148} />;

    const claimedOrEmpty = listOfStatus.includes(RedPacketStatus.claimed) || isEmpty;

    return (
        <>
            <Card
                className={cx(classes.root, cover ? classes.fireflyRoot : classes.maskRoot)}
                component="article"
                elevation={0}
                style={
                    cover
                        ? {
                              backgroundSize: 'contain',
                              backgroundImage: `url(${cover.backgroundImageUrl})`,
                              backgroundColor: cover.backgroundColor,
                          }
                        : undefined
                }
            >
                {cover ? <Image alt="cover" className={classes.cover} src={cover.url!} /> : null}
                <Image
                    alt="Token"
                    aria-label="Token"
                    src={new URL('@/mask/plugins/red-packet/assets/tokenLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                    width={188}
                    height={188}
                />
                <div className={classes.header}>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {listOfStatus.length ? (
                        <Typography
                            className={classes.label}
                            variant="body2"
                            style={{ cursor: claimedOrEmpty ? 'pointer' : undefined }}
                            onClick={() => {
                                if (claimedOrEmpty) setShowRequirements((v) => !v);
                            }}
                        >
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    ) : null}
                </div>
                {cover ? (
                    <Grow in={showRequirements ? !checkingClaimStatus : false} timeout={250}>
                        <Requirements
                            showResults={!claimedOrEmpty}
                            statusList={claimStrategyStatus?.claimStrategyStatus ?? EMPTY_LIST}
                            className={classes.requirements}
                            onClose={() => setShowRequirements(false)}
                        />
                    </Grow>
                ) : (
                    <div className={classes.content}>
                        <Stack />
                        <div className={classes.messageBox}>
                            <Typography className={classes.words} variant="h6">
                                {payload.sender.message}
                            </Typography>
                        </div>
                        <div className={classes.bottomContent}>
                            <div>
                                <Typography variant="body2" className={classes.myStatus}>
                                    {subtitle}
                                </Typography>
                                <Typography className={classes.myStatus} variant="body1">
                                    {myStatus}
                                </Typography>
                            </div>
                            <Typography className={classes.from} variant="body1">
                                <Trans>From: @{payload.sender.name || '-'}</Trans>
                            </Typography>
                        </div>
                    </div>
                )}
            </Card>
            {outdated ? null : myHandle ? (
                <OperationFooter
                    chainId={payloadChainId}
                    canClaim={canClaim}
                    canRefund={canRefund}
                    isClaiming={isClaiming || checkingClaimStatus}
                    isRefunding={isRefunding}
                    onShare={handleShare}
                    onClaimOrRefund={onClaimOrRefund}
                />
            ) : (
                <RequestLoginFooter
                    onRequest={() => {
                        LoginModalRef.open({ source: source as SocialSource });
                    }}
                />
            )}
        </>
    );
});

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed';
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded';
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired';
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty';
    return '';
}
