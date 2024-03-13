import { t } from '@lingui/macro';
import { memo, useState } from 'react';

import AdjustmentsIcon from '@/assets/adjustments.svg';
import ComebackIcon from '@/assets/comeback.svg';
import FireflyIcon from '@/assets/firefly.svg';
import MagnifierIcon from '@/assets/magnifier.svg';
import MenuIcon from '@/assets/menu.svg';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

interface NavigatorBarForMobileProps {
    title: string;
}

export const NavigatorBarForMobile = memo(function NavigatorBarForMobile({ title }: NavigatorBarForMobileProps) {
    const [searchMode, setSearchMode] = useState(false);

    const lensProfile = useLensStateStore.use.currentProfile?.();
    const farcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    return (
        <header className=" flex items-center gap-4 px-4 py-[7px] text-main">
            <div className=" flex h-[30px] w-[30px] justify-center">
                {searchMode ? (
                    <button onClick={() => setSearchMode(false)}>
                        <ComebackIcon />
                    </button>
                ) : (
                    <>
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
                    </>
                )}
            </div>
            <h1 className=" flex flex-1 justify-center items-center h-10">
                {searchMode ? (
                    <div className=" relative flex flex-1 items-center">
                        <MagnifierIcon className=" absolute left-3" width={18} height={18} />
                        <input
                            className=" flex-1 rounded-xl border-none bg-bg px-0 py-[11px] pl-10 text-sm leading-[18px]"
                            placeholder={t`Search…`}
                        />
                    </div>
                ) : (
                    <>
                        {(farcasterProfile || lensProfile) && title ? (
                            <span className=" text-[20px] font-bold leading-[24px]">{title}</span>
                        ) : (
                            <FireflyIcon />
                        )}
                    </>
                )}
            </h1>
            <div className=" flex h-[30px] w-[30px] justify-center">
                {searchMode ? (
                    <button>
                        <AdjustmentsIcon />
                    </button>
                ) : (
                    <button>
                        <MagnifierIcon onClick={() => setSearchMode(true)} />
                    </button>
                )}
            </div>
        </header>
    );
});
