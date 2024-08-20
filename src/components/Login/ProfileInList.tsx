import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { ProfileAvatar, type ProfileAvatarProps } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    selected?: boolean;
    selectable?: boolean;
    profile: Profile;
    onSelect?: (profile: Profile) => void;
    ProfileAvatarProps?: Partial<ProfileAvatarProps>;
}

export function ProfileInList({
    selected = false,
    selectable = true,
    profile,
    onSelect,
    ProfileAvatarProps,
}: ProfileInListProps) {
    const content = (
        <>
            <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                    background:
                        'radial-gradient(circle at center, rgba(255, 184, 224, 1), rgba(190, 158, 255, 1), rgba(136, 192, 252, 1), rgba(134, 255, 153, 1))',
                }}
            >
                <ProfileAvatar profile={profile} size={48} {...ProfileAvatarProps} />
            </div>
            <ProfileName profile={profile} />
            {selectable ? <CircleCheckboxIcon className="shrink-0" checked={selected} /> : null}
        </>
    );

    return selectable ? (
        <ClickableButton
            className="inline-flex h-12 w-full items-center justify-start gap-4 outline-none"
            onClick={() => onSelect?.(profile)}
        >
            {content}
        </ClickableButton>
    ) : (
        <div className="inline-flex h-12 w-full items-center justify-start gap-4 outline-none">{content}</div>
    );
}
