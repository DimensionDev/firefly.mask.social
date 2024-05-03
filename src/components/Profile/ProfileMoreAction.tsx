import { Menu, type MenuProps, Transition } from '@headlessui/react';
import { EllipsisHorizontalCircleIcon, LinkIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { motion } from 'framer-motion';
import { Fragment, memo } from 'react';
import { useCopyToClipboard } from 'react-use';
import urlcat from 'urlcat';

import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface MoreProps extends Omit<MenuProps<'div'>, 'className'> {
    profile: Profile;
    className?: string;
}

export const ProfileMoreAction = memo<MoreProps>(function ProfileMoreAction({ profile, className, ...rest }) {
    const [, copyToClipboard] = useCopyToClipboard();

    return (
        <Menu className={classNames('relative', className as string)} as="div" {...rest}>
            <Menu.Button
                whileTap={{ scale: 0.9 }}
                as={motion.button}
                className="flex items-center text-secondary"
                aria-label="More"
            >
                <EllipsisHorizontalCircleIcon width={32} height={32} />
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
                    className="absolute right-0 z-[1000] flex w-max flex-col space-y-2 overflow-hidden rounded-2xl border border-line bg-primaryBottom text-main"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >
                    <Menu.Item>
                        {({ close }) => (
                            <ClickableButton
                                className="flex cursor-pointer items-center space-x-2 p-4 hover:bg-bg"
                                onClick={async () => {
                                    close();
                                    copyToClipboard(urlcat(location.origin, getProfileUrl(profile)));
                                    enqueueSuccessMessage(t`Copied`);
                                }}
                            >
                                <LinkIcon width={24} height={24} />
                                <span className="text-[17px] font-bold leading-[22px] text-main">
                                    <Trans>Copy Link</Trans>
                                </span>
                            </ClickableButton>
                        )}
                    </Menu.Item>
                    <Menu.Item>{({ close }) => <ReportUserButton onConfirm={close} profile={profile} />}</Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
});
