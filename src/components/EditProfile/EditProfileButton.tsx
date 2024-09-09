import { Trans } from '@lingui/macro';
import { useCallback, useState } from 'react';

import EditProfileIcon from '@/assets/edit-profile.svg';
import { ClickableButton, type ClickableButtonProps } from '@/components/ClickableButton.js';
import { EditProfileDialog } from '@/components/EditProfile/EditProfileDialog.js';
import { classNames } from '@/helpers/classNames.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface EditProfileButtonProps extends Omit<ClickableButtonProps, 'children'> {
    variant?: 'text' | 'icon';
    profile: Profile;
}

export function EditProfileButton({ profile, variant = 'text', className, ...props }: EditProfileButtonProps) {
    const [open, setOpen] = useState(false);
    const onClose = useCallback(() => setOpen(false), []);
    const children = {
        text: <Trans>Edit Profile</Trans>,
        icon: <EditProfileIcon className="h-4 w-4 flex-shrink-0" />,
    }[variant];
    return (
        <>
            <EditProfileDialog open={open} onClose={onClose} profile={profile} />
            <ClickableButton
                {...props}
                onClick={() => setOpen(true)}
                className={classNames(
                    'flex h-8 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-lightMain px-4 text-medium font-bold leading-5 text-lightMain',
                    className,
                )}
            >
                {children}
            </ClickableButton>
        </>
    );
}
