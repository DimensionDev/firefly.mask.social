import { useMotionValueEvent, useScroll } from 'framer-motion';
import { type HTMLProps, useState } from 'react';

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
import { useFireflyIdentityState } from '@/store/useFireflyIdentityStore.js';

interface TitleProps extends HTMLProps<HTMLDivElement> {
    profile?: Profile | null;
    profiles?: FireflyProfile[];
    /** Always visible */
    sticky?: boolean;
    isOthersProfile?: boolean;
    keepVisible?: boolean;
    disableActions?: boolean;
}

export function Title({
    profile,
    profiles = EMPTY_LIST,
    sticky,
    isOthersProfile,
    keepVisible,
    disableActions,
    className,
    ...rest
}: TitleProps) {
    const isMedium = useIsMedium();

    const [reached, setReached] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (value) => {
        if (keepVisible) return;
        setReached(value > 60);
    });

    const comeback = useComeBack();
    const { identity: identity } = useFireflyIdentityState();

    const { walletProfile } = resolveFireflyProfiles(identity, profiles);

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

    const hidden = !reached && !keepVisible;

    return (
        <div className={classNames('sticky top-0 z-30 w-full', { hidden }, className)} {...rest} aria-hidden={hidden}>
            <div className={classNames('z-30 flex h-[60px] w-full items-center bg-primaryBottom pl-4 pr-3')}>
                <div className="mr-auto flex items-center gap-7 overflow-auto">
                    <ComeBackIcon className="shrink-0 cursor-pointer text-lightMain" onClick={comeback} />
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-black text-lightMain">
                        {displayName ?? '-'}
                    </span>
                </div>

                {disableActions ? null : <div className="flex flex-shrink-0 gap-2">{renderActions()}</div>}
            </div>
        </div>
    );
}
