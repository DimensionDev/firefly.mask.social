import { Trans } from '@lingui/macro';

import { ClickableButton } from '@/components/ClickableButton.js';

export function EditProfileButton() {
    return (
        <ClickableButton className="flex h-8 items-center justify-center rounded-full border border-lightMain px-5 text-[15px] font-bold leading-5 text-lightMain">
            <Trans>Edit Profile</Trans>
        </ClickableButton>
    );
}
