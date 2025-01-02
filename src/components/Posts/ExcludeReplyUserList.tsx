'use client';

import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Fragment, type PropsWithChildren } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
import { ClickableArea } from '@/components/ClickableArea.js';
import { Popover as PopoverModal } from '@/components/Popover.js';
import { classNames } from '@/helpers/classNames.js';
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
            <span className="ml-2">{profile.displayName}</span>
            <span className="ml-1 mr-auto text-second">@{profile.handle}</span>
            <CircleCheckboxIcon
                checked={checked}
                className={classNames({
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
                .filter((profile) => profile.profileId !== post.author.profileId)
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
            <Popover as="div" className="fixed">
                {() => (
                    <>
                        <Popover.Button className="flex cursor-pointer gap-1 text-main focus:outline-none">
                            {children}
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel
                                static
                                className="absolute bottom-full left-0 z-50 w-[280px] -translate-y-3 rounded-lg bg-lightBottom px-3 py-3 text-main shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none"
                            >
                                <ExcludeReplyUserList {...props} />
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
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
