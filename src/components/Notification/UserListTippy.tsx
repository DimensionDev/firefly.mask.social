import { memo, type PropsWithChildren } from 'react';

import { ProfileCell } from '@/components/Profile/ProfileCell.js';
import { Tippy } from '@/esm/Tippy.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export interface Props extends PropsWithChildren {
    users: Profile[];
    className?: string;
}

export const UserListTippy = memo<Props>(function UserListTippy({ users, className, children }) {
    return (
        <Tippy
            appendTo={() => document.body}
            maxWidth={350}
            className="tippy-card"
            placement="bottom"
            duration={500}
            delay={300}
            arrow={false}
            hideOnClick
            interactive
            content={
                <div
                    className="max-h-[330px] w-[346px] overflow-auto rounded-2xl border border-secondaryLine bg-primaryBottom"
                    data-hide-scrollbar
                >
                    {users.map((profile) => (
                        <ProfileCell key={profile.profileId} profile={profile} source={profile.source} />
                    ))}
                </div>
            }
        >
            <span className={className}>{children}</span>
        </Tippy>
    );
});
