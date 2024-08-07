'use client';

import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';

import { AddWalletButton } from '@/app/(settings)/components/AddWalletButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { WalletGroup } from '@/app/(settings)/components/WalletGroup.js';
import LoadingIcon from '@/assets/loading.svg';
import { Loading } from '@/components/Loading.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export default function Wallets() {
    useNavigatorTitle(t`Associated wallets`);

    const {
        data: { connected = EMPTY_LIST, related = EMPTY_LIST } = {},
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['my-wallet-connections'],
        queryFn: () => FireflySocialMediaProvider.getAllConnections(),
    });

    return (
        <Section>
            <Headline>
                <Trans>Associated wallets</Trans>
                {isRefetching ? (
                    <LoadingIcon className="ml-1 inline-block animate-spin" width={20} height={20} />
                ) : null}
            </Headline>
            {!isLoading && connected.length === 0 && related.length === 0 ? (
                <NoResultsFallback message={t`No available wallet.`} />
            ) : null}
            {isLoading ? <Loading className="!min-h-[200px]" /> : null}
            <WalletGroup title={t`Connected in Firefly`} connections={connected} />
            <WalletGroup
                title={t`Related by platforms`}
                connections={related}
                noAction
                tooltip={t`Wallets retrieved from public verifiable data registries or our entity algorithm can be reported for disconnection.`}
            />
            {!isLoading ? (
                <div className="flex justify-center">
                    <AddWalletButton disabled={isRefetching} />
                </div>
            ) : null}
        </Section>
    );
}
