'use client';

import { PlatformIcon } from '@/app/profile/components/PlatformIcon.js';
import PlusIcon from '@/assets/plus.svg';
import { Image } from '@/components/Image.js';
import { SocialPlatform } from '@/constants/enum.js';
import { FarcasterStatusModalRef, LensStatusModalRef, LoginModalRef } from '@/modals/controls.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function LoginStatusBar() {
    const lensAccount = useLensStateStore.use.currentAccount?.();
    const farcasterAccount = useFarcasterStateStore.use.currentAccount?.();

    return (
        <div className="flex gap-x-2 pl-2">
            {lensAccount ? (
                <button className="relative h-[40px] w-[48px]" onClick={() => LensStatusModalRef.open()}>
                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                        <Image
                            src={lensAccount.avatar}
                            alt="avatar"
                            width={40}
                            height={40}
                            className="rounded-[99px]"
                        />
                    </div>
                    <PlatformIcon
                        className="absolute left-[32px] top-[24px] rounded-[99px] border border-white shadow"
                        platform={SocialPlatform.Lens}
                        size={16}
                    />
                </button>
            ) : null}
            {farcasterAccount && !!farcasterAccount.profileId ? (
                <button className="relative h-[40px] w-[48px]" onClick={() => FarcasterStatusModalRef.open()}>
                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                        <Image
                            src={farcasterAccount.avatar}
                            alt="avatar"
                            width={40}
                            height={40}
                            className="rounded-[99px]"
                        />
                    </div>
                    <PlatformIcon
                        className="absolute left-[32px] top-[24px] rounded-[99px] border border-white shadow"
                        platform={SocialPlatform.Farcaster}
                        size={16}
                    />
                </button>
            ) : (
                <button
                    className="relative h-[40px] w-[48px]"
                    onClick={() => LoginModalRef.open({ current: SocialPlatform.Farcaster })}
                >
                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                        <PlatformIcon platform={SocialPlatform.Farcaster} size={40} />
                    </div>
                    <PlusIcon
                        className="absolute left-[32px] top-[24px] rounded-[99px] shadow"
                        width={16}
                        height={16}
                    />
                </button>
            )}
            {lensAccount ? null : (
                <button
                    className="relative h-[40px] w-[48px]"
                    onClick={() => LoginModalRef.open({ current: SocialPlatform.Lens })}
                >
                    <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                        <PlatformIcon platform={SocialPlatform.Lens} size={40} />
                    </div>
                    <PlusIcon
                        className="absolute left-[32px] top-[24px] rounded-[99px] shadow"
                        width={16}
                        height={16}
                    />
                </button>
            )}
        </div>
    );
}
