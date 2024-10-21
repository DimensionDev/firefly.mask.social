import { MenuItem, type MenuProps } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { memo } from 'react';
import urlcat from 'urlcat';

import MoreCircleIcon from '@/assets/more-circle.svg';
import LinkIcon from '@/assets/small-link.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteAllByProfile } from '@/components/Actions/MuteAllProfile.js';
import { MuteProfileButton } from '@/components/Actions/MuteProfileButton.js';
import { ReportProfileButton } from '@/components/Actions/ReportProfileButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Source } from '@/constants/enum.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { useCopyText } from '@/hooks/useCopyText.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useReportProfile } from '@/hooks/useReportProfile.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface ProfileMoreActionProps extends Omit<MenuProps<'div'>, 'className'> {
    className?: string;
    profile: Profile;
}

export const ProfileMoreAction = memo<ProfileMoreActionProps>(function ProfileMoreAction({ className, profile }) {
    const currentProfile = useCurrentProfile(profile.source);
    const profiles = useCurrentFireflyProfilesAll();
    const [, reportProfile] = useReportProfile();
    const [, toggleMutedProfile] = useToggleMutedProfile(currentProfile);
    const [, handleCopy] = useCopyText(urlcat(location.origin, getProfileUrl(profile)));

    const isRelatedProfile = profiles.some((x) => {
        const profileId = resolveFireflyProfileId(profile);
        if (!profileId) return false;

        return isSameFireflyIdentity(x.identity, {
            id: profileId,
            source: profile.source,
        });
    });

    return (
        <MoreActionMenu
            source={profile.source}
            button={<MoreCircleIcon width={32} height={32} />}
            className={className}
        >
            <MenuGroup>
                <MenuItem>
                    {({ close }) => (
                        <MenuButton
                            onClick={() => {
                                close();
                                handleCopy();
                            }}
                        >
                            <LinkIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Copy link to profile</Trans>
                            </span>
                        </MenuButton>
                    )}
                </MenuItem>

                {!isRelatedProfile ? (
                    <>
                        {profile.source === Source.Lens ? (
                            <MenuItem>
                                {({ close }) => (
                                    <ReportProfileButton onConfirm={close} profile={profile} onReport={reportProfile} />
                                )}
                            </MenuItem>
                        ) : null}
                        <MenuItem>
                            {({ close }) => (
                                <MuteProfileButton onConfirm={close} profile={profile} onToggle={toggleMutedProfile} />
                            )}
                        </MenuItem>
                        <MenuItem>{({ close }) => <MuteAllByProfile profile={profile} onClose={close} />}</MenuItem>
                    </>
                ) : null}
            </MenuGroup>
        </MoreActionMenu>
    );
});
