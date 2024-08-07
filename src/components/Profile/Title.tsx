import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import { ProfileAction } from '@/components/Profile/ProfileAction.js';
import { WalletMoreAction } from '@/components/Profile/WalletMoreAction.js';
import { WatchButton } from '@/components/Profile/WatchButton.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { resolveFireflyProfiles } from '@/helpers/resolveFireflyProfiles.js';
import { useComeBack } from '@/hooks/useComeback.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

interface TitleProps {
    profile?: Profile | null;
    profiles?: FireflyProfile[];
    /** Always visible */
    sticky?: boolean;
    isOthersProfile?: boolean;
}

export function Title({ profile, profiles = EMPTY_LIST, sticky, isOthersProfile }: TitleProps) {
    const [reached, setReached] = useState(false);

    const { scrollY } = useScroll();
    const isMedium = useIsMedium();

    useMotionValueEvent(scrollY, 'change', (value) => {
        setReached(value > 60);
    });

    const comeback = useComeBack();
    const { profileTab } = useProfileTabState();

    const { walletProfile } = resolveFireflyProfiles(profileTab, profiles);

    if ((profiles.length > 1 || !isOthersProfile) && !reached && isMedium && !sticky) return null;

    const renderActions = () => {
        if (!reached && isMedium && !sticky) return null;
        if (profile) return <ProfileAction profile={profile} />;
        if (walletProfile)
            return (
                <>
                    {isOthersProfile ? <WatchButton address={walletProfile.address} /> : null}
                    <WalletMoreAction className="text-main" profile={walletProfile} />
                </>
            );
        return null;
    };

    const displayName = walletProfile
        ? walletProfile.primary_ens ?? formatEthereumAddress(walletProfile.address, 4)
        : profile?.displayName;

    return (
        <div className="sticky top-0 z-30 h-0 w-full">
            <div
                className={classNames(
                    'absolute left-0 top-0 z-30 flex h-[60px] w-full items-center bg-primaryBottom pl-4 pr-3',
                    {
                        hidden: !reached,
                    },
                )}
            >
                <div className="mr-auto flex items-center gap-7 overflow-auto">
                    <ComeBackIcon className="shrink-0 cursor-pointer text-lightMain" onClick={comeback} />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-black text-lightMain">
                        {displayName ?? '-'}
                    </span>
                </div>

                <div className="flex flex-shrink-0 gap-2">{renderActions()}</div>
            </div>
        </div>
    );
}
