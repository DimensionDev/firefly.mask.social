import { Trans } from '@lingui/macro';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from '@tanstack/react-router';
import { memo } from 'react';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';

export const LensViewBeforeLoad = () => {
    return {
        title: <Title />,
    };
};

function Title() {
    const account = useAccount();
    if (account.isReconnecting) return <Trans>Connecting Wallet</Trans>;
    return <Trans>Select Account</Trans>;
}

export const LensView = memo(function LensView() {
    const account = useAccount();
    const { expectedProfile } = useLocation().search as { expectedProfile?: string };

    const { error } = useQuery({
        queryKey: ['wallet-account'],
        retry: 0,
        queryFn: async () => {
            const { account } = await getWalletClientRequired(config);
            return account.address;
        },
    });

    const { data: profiles = EMPTY_LIST } = useQuery({
        queryKey: ['lens', 'profiles', account.address, expectedProfile],
        queryFn: account.address ? () => LensSocialMediaProvider.getProfilesByAddress(account.address!) : skipToken,
        select: (profiles) => {
            if (!profiles) return EMPTY_LIST;
            const { accounts } = getProfileState(Source.Lens);
            const list = profiles.filter((x) => !accounts.some((y) => isSameProfile(x, y.profile)));
            if (expectedProfile) return list.sort((x) => (x.profileId === expectedProfile ? -1 : 0));
            return list;
        },
    });

    if ((error as Error | undefined)?.name === 'ConnectorNotConnectedError') {
        return <Navigate to="/main" replace />;
    }

    if (!profiles.length || !account.address)
        return (
            <div className="flex h-full min-h-[30vh] w-full items-center justify-center md:h-[462px] md:w-[500px]">
                <LoadingIcon className="animate-spin" width={24} height={24} />
            </div>
        );

    return <LoginLens profiles={profiles} currentAccount={account.address} />;
});
