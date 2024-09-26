'use client';

import { Trans } from '@lingui/macro';
import { useContext, useMemo } from 'react';
import { useAccount, useEnsName } from 'wagmi';

import { CZActivityContext } from '@/components/ActivityPage/CZ/CZActivityContext.js';
import { CZActivityHomePageButton } from '@/components/ActivityPage/CZ/CZActivityHomePageButton.js';
import { Source } from '@/constants/enum.js';
import { Image } from '@/esm/Image.js';
import { Link } from '@/esm/Link.js';
import { formatAddress } from '@/helpers/formatAddress.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useCZActivityCheckResponse } from '@/hooks/useCZActivityCheckResponse.js';
import { CZActivity } from '@/providers/types/Firefly.js';

export function CZActivityHomePage() {
    const account = useAccount();
    const { type, goChecklist } = useContext(CZActivityContext);
    const { data, isLoading } = useCZActivityCheckResponse();
    const twitterProfile = useCurrentProfile(Source.Twitter);
    const { data: ens } = useEnsName({ address: account.address });
    const { title, description } = useMemo(() => {
        if (!twitterProfile) {
            return {
                title: <Trans>Reward for followers</Trans>,
                description: (
                    <Trans>
                        Get a free special edition Firefly NFT for following{' '}
                        <Link className="text-highlight" href={resolveProfileUrl(Source.Twitter, '902926941413453824')}>
                            @cz_binance
                        </Link>{' '}
                        on X to celebrate CZ’s return!
                    </Trans>
                ),
            };
        }
        if (!account.address) {
            return {
                title: <Trans>Almost there!</Trans>,
                description: <Trans>Connect your wallet to claim your NFT.</Trans>,
            };
        }
        if (data?.alreadyClaimed) {
            return {
                title: <Trans>Already claimed</Trans>,
                description: <Trans>Each wallet or X account is limited to one claim.</Trans>,
            };
        }
        if (type === 'page') {
            return {
                title: <Trans>Welcome Back CZ Collectible</Trans>,
                description: (
                    <Trans>
                        Get a free special edition Firefly NFT for following{' '}
                        <Link className="text-highlight" href={resolveProfileUrl(Source.Twitter, '902926941413453824')}>
                            @cz_binance
                        </Link>{' '}
                        on X to celebrate CZ’s return!
                    </Trans>
                ),
            };
        }
        if (data?.canClaim) {
            return {
                title: <Trans>{ens ?? formatAddress(account.address, 4)} is eligible!</Trans>,
                description:
                    data?.level === CZActivity.Level.Lv2 ? (
                        <Trans>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            You're eligible for a <b>Premium</b> CZ Support NFT because your .bnb domain is member of
                            the SPACE <b>ID Premier Club</b>.
                        </Trans>
                    ) : (
                        <Trans>Claim your NFT to show your support onchain for CZ!</Trans>
                    ),
            };
        }
        return {
            title: <Trans>Not eligible</Trans>,
            description: (
                <Trans>
                    Must followed{' '}
                    <Link className="text-highlight" href={resolveProfileUrl(Source.Twitter, '902926941413453824')}>
                        @cz_binance
                    </Link>{' '}
                    on X before Sept 21, 2024.
                </Trans>
            ),
        };
    }, [account.address, data?.alreadyClaimed, data?.canClaim, data?.level, ens, twitterProfile, type]);

    return (
        <div className="flex w-full flex-col items-center space-y-8">
            <Image src="/image/activity/cz/nft.png" width={162} height={162} alt="cz-nft" />
            <div className="flex flex-col space-y-1 text-center leading-[90%]">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm font-normal">{description}</p>
            </div>
            <div className="flex flex-col space-y-1.5 text-center">
                <CZActivityHomePageButton />
            </div>
        </div>
    );
}
