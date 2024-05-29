'use client';

import { Trans } from '@lingui/macro';

import { TextLink } from '@/app/(settings)/components/TextLink.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { useMuteMenuList } from '@/hooks/useMuteMenuList.js';

export function SettingsList() {
    const isLoggedIn = useIsLogin();
    const muteMenuList = useMuteMenuList();

    return (
        <div className="flex min-h-full min-w-full flex-col p-6 md:min-w-[280px] md:border-r md:border-line">
            <div className=" hidden pb-6 text-[20px] font-bold leading-[24px] text-lightMain md:block">
                <Trans>Settings</Trans>
            </div>
            {[
                { name: <Trans>General</Trans>, link: '/general' },
                { name: <Trans>Connected Accounts</Trans>, link: '/connected', isHidden: !isLoggedIn },
                { name: <Trans>Communities</Trans>, link: '/communities' },
                { name: <Trans>Mutes</Trans>, link: '/mutes', isHidden: !muteMenuList.length },
                { name: <Trans>More</Trans>, link: '/more' },
            ].map(({ name, link, isHidden }) => {
                return isHidden ? null : (
                    <TextLink key={link} name={name} link={`/settings${link}`} />
                );
            })}
        </div>
    );
}
