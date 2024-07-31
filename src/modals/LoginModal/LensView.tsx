import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
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

export const LensView = memo(function LensView() {
    const account = useAccount();
    const { expectedProfile } = useLocation().search as { expectedProfile?: string };

    const { data: profiles = EMPTY_LIST } = useQuery({
        queryKey: ['lens', 'profiles', account.address, expectedProfile],
        queryFn: async () => {
            try {
                const { account } = await getWalletClientRequired(config);
                if (!account.address) return;
                return LensSocialMediaProvider.getProfilesByAddress(account.address!);
            } catch (err) {
                if ((err as Error).name === 'ConnectorNotConnectedError') return null;
                throw err;
            }
        },
        select: (profiles) => {
            if (!profiles) return EMPTY_LIST;
            const { accounts } = getProfileState(Source.Lens);
            const list = profiles.filter((x) => !accounts.some((y) => isSameProfile(x, y.profile)));
            if (expectedProfile) return list.sort((x) => (x.profileId === expectedProfile ? -1 : 0));
            return list;
        },
    });

    if (!profiles.length || !account.address)
        return (
            <div className="flex h-[462px] w-[500px] items-center justify-center">
                <LoadingIcon className="animate-spin" width={24} height={24} />
            </div>
        );

    return <LoginLens profiles={profiles} currentAccount={account.address} />;
});
