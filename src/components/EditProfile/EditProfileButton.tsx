import { Trans } from '@lingui/macro';
import { useState } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { EditProfileDialog } from '@/components/EditProfile/EditProfileDialog.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function EditProfileButton({ profile }: { profile: Profile }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <EditProfileDialog open={open} onClose={() => setOpen(false)} profile={profile} />
            <ClickableButton
                onClick={() => setOpen(true)}
                className="flex h-8 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-lightMain px-5 text-[15px] font-bold leading-5 text-lightMain"
            >
                <Trans>Edit Profile</Trans>
            </ClickableButton>
        </>
    );
}
