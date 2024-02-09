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
                <button
                    className="text-[15px] font-bold leading-none text-red-500"
                    onClick={() => {
                        LogoutModalRef.open({ source: profile.source, profile });
                    }}
                >
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button
                    className="text-right text-[15px] font-bold leading-none text-main disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={profile.source === SocialPlatform.Farcaster}
                    onClick={() => {
                        login(profile);
                    }}
                >
                    <Trans>Switch</Trans>
                </button>
            )}
        </div>
    );
}
