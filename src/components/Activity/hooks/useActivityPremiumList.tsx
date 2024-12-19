// cSpell:disable
import { Trans } from '@lingui/macro';
import { ChainId } from '@masknet/web3-shared-evm';
import { useContext } from 'react';

import { ActivityContext } from '@/components/Activity/ActivityContext.js';
import { useActivityElex24Involved } from '@/components/Activity/ActivityElex24/useActivityElex24Involved.js';
import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Link } from '@/components/Activity/Link.js';
import type { SocialSource } from '@/constants/enum.js';
import {
    LIL_PUDGY_NFT_ADDRESS,
    PENGU_PINS_NFT_ADDRESS,
    PUDGY_PENGUINS_NFT_ADDRESS,
    TRUE_PENGU_NFT_ADDRESS,
} from '@/constants/index.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { Level } from '@/providers/types/CZ.js';

export function useActivityPremiumList(source: SocialSource) {
    const { name } = useContext(ActivityContext);
    const { data } = useActivityClaimCondition(source);
    const { data: isInvolvedElex24 } = useActivityElex24Involved();

    switch (name) {
        case 'elex24':
            return [
                {
                    label: <Trans>Your X account holds Premium status</Trans>,
                    verified: data?.x?.level === Level.Lv2,
                },
                {
                    label: <Trans>Your Farcaster account holds Power Badge</Trans>,
                    verified: data?.farcaster.isPowerUser,
                },
                {
                    label: (
                        <span>
                            <Trans>
                                Get involved in the{' '}
                                <Link
                                    href="https://polymarket.com/event/presidential-election-winner-2024?tid=1729592888743"
                                    target="_blank"
                                    className="inline text-highlight"
                                >
                                    Presidential Election Winner 2024
                                </Link>{' '}
                                on Polymarket
                            </Trans>
                        </span>
                    ),
                    verified: isInvolvedElex24,
                },
            ];
        case 'hlbl':
            return [
                {
                    label: <Trans>Your X account holds Premium status</Trans>,
                    verified: data?.x?.level === Level.Lv2,
                },
                {
                    label: <Trans>Your Farcaster account holds Power Badge</Trans>,
                    verified: data?.farcaster.isPowerUser,
                },
                {
                    label: <Trans>Your assets on Base Chain are worth over US$10,000</Trans>,
                    verified: data?.balance?.level === Level.Lv2,
                },
            ];
        case 'frensgiving':
            return [
                {
                    label: <Trans>Your Farcaster account holds Power Badge</Trans>,
                    verified: data?.farcaster.isPowerUser,
                },
                {
                    label: <Trans>You have been detected as a loyal Farcaster user</Trans>,
                    verified: data?.farcaster.isSupercast || (data && parseInt(data.farcaster.fid, 10) <= 10000),
                },
            ];
        case 'pengu':
            return [
                {
                    label: (
                        <p>
                            <Trans>
                                You are holder of{' '}
                                <Link
                                    href={resolveNftUrl(ChainId.Mainnet, PUDGY_PENGUINS_NFT_ADDRESS)}
                                    className="inline text-highlight"
                                >
                                    Pudgy Penguins
                                </Link>{' '}
                                or{' '}
                                <Link
                                    href={resolveNftUrl(ChainId.Mainnet, LIL_PUDGY_NFT_ADDRESS)}
                                    className="inline text-highlight"
                                >
                                    Lil Pudgy
                                </Link>{' '}
                                NFTs
                            </Trans>
                        </p>
                    ),
                    verified: data?.nft?.ownPudgy || data?.nft?.ownLil,
                },
                {
                    label: (
                        <p>
                            <Trans>
                                You are holder of{' '}
                                <Link
                                    href={resolveNftUrl(ChainId.Mainnet, TRUE_PENGU_NFT_ADDRESS)}
                                    className="inline text-highlight"
                                >
                                    truePengu
                                </Link>{' '}
                                or{' '}
                                <Link
                                    href={resolveNftUrl(ChainId.Mainnet, PENGU_PINS_NFT_ADDRESS)}
                                    className="inline text-highlight"
                                >
                                    penguPins
                                </Link>{' '}
                                Soulbound NFTs
                            </Trans>
                        </p>
                    ),
                    verified: data?.nft?.ownPudgy || data?.nft?.ownPenguPins,
                },
            ];
        default:
            return [];
    }
}
