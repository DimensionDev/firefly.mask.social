import { Trans } from '@lingui/macro';

import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface AccountCardProps {
    profile: Profile;
    isCurrent: boolean;
}

export function AccountCard({ profile, isCurrent }: AccountCardProps) {
    return (
        <div
            className="inline-flex h-[63px] w-full items-center justify-start gap-2 rounded-lg bg-white bg-bottom px-[12px] py-[8px] dark:bg-bg"
            style={{ boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)' }}
        >
            <ProfileAvatar profile={profile} size={36} />
            <ProfileName profile={profile} />
            {isCurrent ? (
                <button className=" text-xs font-bold leading-none text-red-500">
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button className="text-right  text-xs font-medium leading-none text-main">
                    <Trans>Switch</Trans>
                </button>
            )}
        </div>
    );
}
