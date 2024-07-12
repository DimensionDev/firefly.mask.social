import { Menu, type MenuProps } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { memo } from 'react';
import { useCopyToClipboard } from 'react-use';
import urlcat from 'urlcat';

import MoreCircleIcon from '@/assets/more-circle.svg';
import LinkIcon from '@/assets/small-link.svg';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { MuteProfileButton } from '@/components/Actions/MuteProfileButton.js';
import { ReportProfileButton } from '@/components/Actions/ReportProfileButton.js';
import { MoreActionMenu } from '@/components/MoreActionMenu.js';
import { Source } from '@/constants/enum.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useReportProfile } from '@/hooks/useReportProfile.js';
import { useToggleMutedProfile } from '@/hooks/useToggleMutedProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    isMyProfile?: boolean;
    profile: Profile;
    className?: string;
}

export const ProfileMoreAction = memo<MoreProps>(function ProfileMoreAction({ profile, className, isMyProfile = false }) {
    const [, copyToClipboard] = useCopyToClipboard();
    const currentProfile = useCurrentProfile(profile.source);
    const [, reportProfile] = useReportProfile();
    const [, toggleMutedProfile] = useToggleMutedProfile(currentProfile);

    return (
        <MoreActionMenu button={<MoreCircleIcon width={32} height={32} />} className={className}>
            <Menu.Items
                className="absolute right-0 z-[1000] flex w-max flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom py-3 text-base text-main"
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                <Menu.Item>
                    {({ close }) => (
                        <MenuButton
                            onClick={async () => {
                                close();
                                copyToClipboard(urlcat(location.origin, getProfileUrl(profile)));
                                enqueueSuccessMessage(t`Copied`);
                            }}
                        >
                            <LinkIcon width={18} height={18} />
                            <span className="font-bold leading-[22px] text-main">
                                <Trans>Copy link</Trans>
                            </span>
                        </MenuButton>
                    )}
                </Menu.Item>

                {!isMyProfile ? (
                    <>
                        {profile.source === Source.Lens ? (
                            <Menu.Item>
                                {({ close }) => (
                                    <ReportProfileButton onConfirm={close} profile={profile} onReport={reportProfile} />
                                )}
                            </Menu.Item>
                        ) : null}
                        <Menu.Item>
                            {({ close }) => (
                                <MuteProfileButton onConfirm={close} profile={profile} onToggle={toggleMutedProfile} />
                            )}
                        </Menu.Item>
                    </>
                ) : null}
            </Menu.Items>
        </MoreActionMenu>
    );
});
