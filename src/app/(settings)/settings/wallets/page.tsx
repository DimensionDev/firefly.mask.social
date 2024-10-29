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
import { STATUS, WalletSource } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

function filterMPCWallets(connections: FireflyWalletConnection[], noMPC = false) {
    if (env.external.NEXT_PUBLIC_PARTICLE !== STATUS.Enabled) return noMPC ? connections : [];

    return connections.filter(({ source }) =>
        noMPC ? source !== WalletSource.Particle : source === WalletSource.Particle,
    );
}

export default function Wallets() {
    useNavigatorTitle(t`Associated wallets`);

    const {
        data: { connected = EMPTY_LIST, related = EMPTY_LIST } = {},
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['my-wallet-connections'],
        queryFn: () => FireflyEndpointProvider.getAllConnections(),
    });

    const mpcWallets = [connected, related].flatMap((connection) => filterMPCWallets(connection));

    return (
        <Section className="max-h-screen overflow-y-auto">
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
            <WalletGroup title={t`Firefly Wallets`} connections={mpcWallets} />
            <WalletGroup title={t`Connected in Firefly`} connections={filterMPCWallets(connected, true)} />
            <WalletGroup
                related
                title={t`Related by platforms`}
                connections={filterMPCWallets(related, true)}
                tooltip={t`Wallets retrieved from public verifiable data registries or our entity algorithm can be reported for disconnection.`}
            />
            {!isLoading ? (
                <div className="flex justify-center">
                    <AddWalletButton connections={connected} disabled={isRefetching} />
                </div>
            ) : null}
        </Section>
    );
}
