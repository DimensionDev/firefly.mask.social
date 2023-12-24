import { Trans } from '@lingui/macro';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useSwitchLensAccount } from '@/hooks/useSwitchLensAccount.js';
import { LogoutModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AccountCardProps {
    profile: Profile;
    isCurrent: boolean;
}

export function AccountCard({ profile, isCurrent }: AccountCardProps) {
    const { login } = useSwitchLensAccount();

    return (
        <div
            className="inline-flex h-[63px] w-full items-center justify-start gap-2 rounded-lg bg-white bg-bottom px-[12px] py-[8px] dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            <ProfileAvatar profile={profile} size={36} />
            <ProfileName profile={profile} />
            {isCurrent ? (
<<<<<<< HEAD
                <button
                    className="font-['Inter'] text-[15px] font-bold leading-none text-red-500"
                    onClick={() => {
                        LogoutModalRef.open({ profile });
                    }}
                >
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button
                    className="text-right font-['Inter'] text-[15px] font-medium leading-none text-main"
                    disabled={profile.source === SocialPlatform.Farcaster}
                    onClick={() => {
                        login(profile);
                    }}
                >
=======
                <button className=" text-xs font-bold leading-none text-red-500">
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button className="text-right  text-xs font-medium leading-none text-main">
>>>>>>> 7b2e63ab2aa9f5ade332936b16e2a4bcf58cfa54
                    <Trans>Switch</Trans>
                </button>
            )}
        </div>
    );
}
