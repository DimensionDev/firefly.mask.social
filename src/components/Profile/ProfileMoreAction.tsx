import { Menu, type MenuProps, Transition } from '@headlessui/react';
import { EllipsisHorizontalCircleIcon, LinkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import { useCopyToClipboard } from 'react-use';
import urlcat from 'urlcat';

import LoadingIcon from '@/assets/loading.svg';
import { BlockUserButton } from '@/components/Actions/BlockUserButton.js';
import { MenuButton } from '@/components/Actions/MenuButton.js';
import { ReportUserButton } from '@/components/Actions/ReportUserButton.js';
import { Source } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useReportUser } from '@/hooks/useReportUser.js';
import { useToggleBlock } from '@/hooks/useToggleBlock.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    profile: Profile;
    className?: string;
}

export const ProfileMoreAction = memo<MoreProps>(function ProfileMoreAction({ profile, className, ...rest }) {
    const [, copyToClipboard] = useCopyToClipboard();
    const currentProfile = useCurrentProfile(profile.source);
    const [{ loading: reporting }, reportUser] = useReportUser(currentProfile);
    const [{ loading: blocking }, toggleBlock] = useToggleBlock(currentProfile);

    const isBusy = reporting || blocking;

    return (
        <Menu className={classNames('relative', className as string)} as="div" {...rest}>
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
            >
                {isBusy ? (
                    <span className="inline-flex h-8 w-8 animate-spin items-center justify-center">
                        <LoadingIcon width={16} height={16} />
                    </span>
                ) : (
                    <EllipsisHorizontalCircleIcon width={32} height={32} />
                )}
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
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
                                <LinkIcon width={24} height={24} />
                                <span className="font-bold leading-[22px] text-main">
                                    <Trans>Copy Link</Trans>
                                </span>
                            </MenuButton>
                        )}
                    </Menu.Item>

                    {profile.source === Source.Lens ? (
                        <Menu.Item>
                            {({ close }) => (
                                <ReportUserButton
                                    busy={reporting}
                                    onConfirm={close}
                                    profile={profile}
                                    onReport={reportUser}
                                />
                            )}
                        </Menu.Item>
                    ) : null}
                    <Menu.Item>
                        {({ close }) => (
                            <BlockUserButton
                                busy={blocking}
                                onConfirm={close}
                                profile={profile}
                                onToggleBlock={toggleBlock}
                            />
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
