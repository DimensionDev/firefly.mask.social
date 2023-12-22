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
        <div className="inline-flex h-[63px] w-full items-center justify-start gap-[8px] rounded-lg bg-bottom px-[12px] py-[8px] shadow-accountCardShadowLight backdrop-blur-lg dark:shadow-accountCardShadowDark">
            <ProfileAvatar profile={profile} size={36} />
            <ProfileName profile={profile} />
            {isCurrent ? (
                <button className="font-['Inter'] text-xs font-medium leading-none text-red-500">
                    <Trans>Log out</Trans>
                </button>
            ) : (
                <button className="text-right font-['Inter'] text-xs font-medium leading-none text-main">
                    <Trans>Switch</Trans>
                </button>
            )}
        </div>
    );
}
