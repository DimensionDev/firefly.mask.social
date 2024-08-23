import { t, Trans } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRouter } from '@tanstack/react-router';
import { memo } from 'react';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { LoginLens } from '@/components/Login/LoginLens.js';
import { config } from '@/configs/wagmiClient.js';
import { Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.jsx';
import { getProfileState } from '@/helpers/getProfileState.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
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
    const router = useRouter();
    const { history } = router;

    const account = useAccount();
    const { expectedProfile } = useLocation().search as { expectedProfile?: string };

    const { data: profiles = EMPTY_LIST, isLoading } = useQuery({
        retry: false,
        queryKey: ['lens', 'profiles', account.address],
        queryFn: async () => {
            try {
                const { account } = await getWalletClientRequired(config);
                const profiles = await LensSocialMediaProvider.getProfilesByAddress(account.address);
                return profiles ?? EMPTY_LIST;
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to fetch profiles.`));
                history.replace('/main');
                throw error;
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

    if (isLoading || !account.address)
        return (
            <div className="flex h-full min-h-[30vh] w-full items-center justify-center md:h-[462px] md:w-[500px]">
                <LoadingIcon className="animate-spin" width={24} height={24} />
            </div>
        );

    return <LoginLens profiles={profiles} currentAccount={account.address} />;
});
