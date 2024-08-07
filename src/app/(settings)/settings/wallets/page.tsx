'use client';

import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';

import { AddWalletButton } from '@/app/(settings)/components/AddWalletButton.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { WalletGroup } from '@/app/(settings)/components/WalletGroup.js';
import LoadingIcon from '@/assets/loading.svg';
import { Loading } from '@/components/Loading.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { isSameAddress } from '@/helpers/isSameAddress.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FarcasterProfile, FireflyProfile, LensV3Profile } from '@/providers/types/Firefly.js';

function getRelations(profiles: FireflyProfile[], address: string) {
    return profiles.filter((profile) => {
        switch (profile.source) {
            case Source.Farcaster:
                return (profile.__origin__ as FarcasterProfile).addresses.some((addr) => isSameAddress(addr, address));
            case Source.Lens:
                return isSameAddress((profile.__origin__ as LensV3Profile).ownedBy, address);
            default:
                return false;
        }
    });
}

function formatProfilesWithRelations(profiles: FireflyProfile[]) {
    return profiles
        .filter((profile) => profile.source === Source.Wallet)
        .map((profile) => ({
            profile,
            relations: getRelations(profiles, profile.identity),
        }));
}

export default function Wallets() {
    useNavigatorTitle(t`Associated wallets`);
    const twitterProfile = useCurrentProfile(Source.Twitter);

    const {
        data: { connected = EMPTY_LIST, related = EMPTY_LIST } = {},
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['my-wallets'],
        queryFn: async () => {
            const profiles = uniqBy(
                [
                    ...(await FireflySocialMediaProvider.getAllPlatformProfiles()),
                    ...(twitterProfile
                        ? await FireflySocialMediaProvider.getAllPlatformProfiles(
                              undefined,
                              undefined,
                              twitterProfile.profileId,
                          )
                        : []),
                ],
                (x) => `${x.identity}/${x.source}`,
            );
            const withRelations = formatProfilesWithRelations(profiles);
            return {
                connected: withRelations.filter((x) => x.relations.length === 0),
                related: withRelations.filter((x) => x.relations.length > 0),
            };
        },
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
            <WalletGroup title={t`Connected in Firefly`} profiles={connected} />
            <WalletGroup
                title={t`Related by platforms`}
                profiles={related}
                tooltip={t`Wallets retrieved from public verifiable data registries or our entity algorithm can be reported for disconnection.`}
            />
            {!isLoading ? (
                <div className="flex justify-center">
                    <AddWalletButton />
                </div>
            ) : null}
        </Section>
    );
}
