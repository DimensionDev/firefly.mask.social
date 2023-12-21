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
        <div className="inline-flex h-[63px] w-full items-center justify-start gap-[8px] rounded-lg bg-white px-[12px] py-[8px] shadow backdrop-blur-lg dark:bg-bg">
            <ProfileAvatar profile={profile} size={36} />
            <ProfileName profile={profile} />
            {isCurrent ? (
                <button className="font-['Inter'] text-xs font-bold leading-none text-red-500">
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button className="text-right font-['Inter'] text-xs font-bold leading-none text-neutral-900">
                    <Trans>Switch</Trans>
                </button>
            )}
        </div>
    );
}
