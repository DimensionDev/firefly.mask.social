import { MenuItem, type MenuProps } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { useRouter } from 'next/navigation.js';
import { memo } from 'react';

import MoreCircleIcon from '@/assets/more-circle.svg';
import SearchIcon from '@/assets/search.svg';
import { CopyLinkButton } from '@/components/Actions/CopyLinkButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteAllByProfile } from '@/components/Actions/MuteAllProfile.js';
import { MuteProfileButton } from '@/components/Actions/MuteProfileButton.js';
import { ReportProfileButton } from '@/components/Actions/ReportProfileButton.js';
import { MenuGroup } from '@/components/MenuGroup.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { SearchType, Source } from '@/constants/enum.js';
import { SORTED_SEARCHABLE_POST_BY_PROFILE_SOURCES } from '@/constants/index.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isCurrentProfile } from '@/helpers/isCurrentProfile.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { resolveSearchUrl } from '@/helpers/resolveSearchUrl.js';
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
    const router = useRouter();

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
                        <CopyLinkButton link={getProfileUrl(profile)} onClick={close}>
                            <Trans>Copy link to profile</Trans>
                        </CopyLinkButton>
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

                {!isCurrentProfile(profile) && SORTED_SEARCHABLE_POST_BY_PROFILE_SOURCES.includes(profile.source) ? (
                    <MenuItem>
                        {({ close }) => (
                            <MenuButton
                                onClick={() => {
                                    close();
                                    router.push(
                                        resolveSearchUrl(`from: ${profile.handle} `, SearchType.Posts, profile.source),
                                    );
                                }}
                            >
                                <SearchIcon width={18} height={18} />
                                <span className="font-bold leading-[22px] text-main">
                                    <Trans>Search in profile</Trans>
                                </span>
                            </MenuButton>
                        )}
                    </MenuItem>
                ) : null}
            </MenuGroup>
        </MoreActionMenu>
    );
});
