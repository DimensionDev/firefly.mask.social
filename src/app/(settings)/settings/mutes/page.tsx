'use client';

import { t, Trans } from '@lingui/macro';

import { TextLink } from '@/app/(settings)/components/TextLink.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { useMuteMenuList } from '@/hooks/useMuteMenuList.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';

export default function Page() {
    useNavigatorTitle(t`Mutes`);
    const menus = useMuteMenuList();

    return (
        <div className="p-6 md:min-w-[280px]">
            <div className="hidden pb-6 text-[20px] font-bold leading-[24px] text-lightMain md:block">
                <Trans>Muted contents</Trans>
            </div>
            <div>
                {menus.map((menu) => (
                    <TextLink
                        key={menu.name}
                        name={menu.name}
                        link={`/settings/mutes/${resolveSourceInUrl(menu.source)}/${menu.type}`}
                    />
                ))}
            </div>
        </div>
    );
}
