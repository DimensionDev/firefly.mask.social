import { memo } from 'react';

import FireflyIcon from '@/assets/firefly.svg';
import MagnifierIcon from '@/assets/magnifier.svg';
import MenuIcon from '@/assets/menu.svg';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export const NavigatorBarForMobile = memo(function NavigatorBarForMobile() {
    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <header className=" flex items-center px-4 py-[7px] text-main">
            <div className=" flex h-[30px] w-[30px]">
                {farcasterProfile ? (
                    <div className=" relative z-10">
                        <ProfileAvatar size={30} profile={farcasterProfile} enableSourceIcon={false} />
                    </div>
                ) : lensProfile ? (
                    <div className=" relative z-10">
                        <ProfileAvatar size={30} profile={lensProfile} enableSourceIcon={false} />
                    </div>
                ) : null}
                {lensProfile ? (
                    <div className=" relative left-[20px]">
                        <ProfileAvatar size={30} profile={lensProfile} enableSourceIcon={false} />
                    </div>
                ) : null}
                {farcasterProfile || lensProfile ? null : <MenuIcon />}
            </div>
            <h1 className=" flex flex-1 justify-center">
                <FireflyIcon />
            </h1>
            <div className=" flex h-[30px] w-[30px]">
                <MagnifierIcon />
            </div>
        </header>
    );
});
