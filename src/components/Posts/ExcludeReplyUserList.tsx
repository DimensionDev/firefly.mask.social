'use client';

import { Popover } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type PropsWithChildren } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { classNames } from '@/helpers/classNames.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';

function ExcludeReplyUserListItem({
    profile,
    onClickProfile,
    checked = false,
    disabled = false,
}: {
    profile: Profile;
    onClickProfile?: (profile: Profile, checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
}) {
    return (
        <ClickableArea
            className={classNames('flex w-full cursor-pointer items-center py-1 text-sm leading-5', {
                'cursor-not-allowed': disabled,
            })}
            disabled={disabled}
            onClick={() => {
                if (disabled) return;
                onClickProfile?.(profile, !checked);
            }}
        >
            <Avatar src={profile.pfp} size={20} alt={profile.profileId} />
            <span className="ml-2 min-w-0 truncate">{profile.displayName}</span>
            <span className="ml-1 mr-auto min-w-0 truncate text-second">@{profile.handle}</span>
            <CircleCheckboxIcon
                checked={checked}
                className={classNames('ml-1 shrink-0', {
                    'opacity-40': disabled,
                })}
            />
        </ClickableArea>
    );
}

interface ExcludeReplyUserListProps {
    profiles: Profile[];
    post: Post;
    excluded?: string[];
    onClickProfile?: (profile: Profile, checked: boolean) => void;
}

export function ExcludeReplyUserList({ post, profiles, excluded = [], onClickProfile }: ExcludeReplyUserListProps) {
    return (
        <div className="flex flex-col gap-2">
            <h4 className="py-1 text-medium font-bold leading-5">
                <Trans>Replying to</Trans>
            </h4>
            <ExcludeReplyUserListItem profile={post.author} checked disabled />
            <h4 className="py-1 text-medium font-bold leading-5">
                <Trans>Others in the conversation</Trans>
            </h4>
            {profiles
                .filter((profile) => !isSameProfile(profile, post.author))
                .map((profile: Profile) => {
                    return (
                        <ExcludeReplyUserListItem
                            profile={profile}
                            key={profile.profileId}
                            onClickProfile={onClickProfile}
                            checked={!excluded.includes(profile.profileId)}
                        />
                    );
                })}
        </div>
    );
}

export function ExcludeReplyUserListModal({
    open,
    onClose,
    children,
    ...props
}: {
    open: boolean;
    onClose: () => void;
} & PropsWithChildren<ExcludeReplyUserListProps>) {
    const isMedium = useIsMedium();

    if (isMedium) {
        return (
            <Popover>
                <Popover.Button className="flex cursor-pointer gap-1 text-main focus:outline-none">
                    {children}
                </Popover.Button>
                <Popover.Panel
                    transition
                    anchor="bottom start"
                    className="fixed bottom-full left-0 z-50 translate-y-1 transition duration-200 ease-in-out data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                >
                    <div className="w-[280px] rounded-lg bg-lightBottom px-3 py-3 text-main shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none">
                        <ExcludeReplyUserList {...props} />
                    </div>
                </Popover.Panel>
            </Popover>
        );
    }

    return (
        <>
            {children}
            <PopoverModal open={open} onClose={onClose}>
                <ExcludeReplyUserList {...props} />
            </PopoverModal>
        </>
    );
}
