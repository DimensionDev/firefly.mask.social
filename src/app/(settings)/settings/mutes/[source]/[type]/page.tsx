'use client';

import { MutedListPage } from '@/app/(settings)/settings/mutes/[source]/[type]/pages/MutedListPage.js';
import type { MuteType, SourceInURL } from '@/constants/enum.js';
import { resolveSourceInUrl } from '@/helpers/resolveSourceInUrl.js';
import { useMuteMenuList } from '@/hooks/useMuteMenuList.js';

interface PageProps {
    params: {
        source: SourceInURL;
        type: MuteType;
    };
}

export default function Page({ params: { source, type } }: PageProps) {
    const muteMenuList = useMuteMenuList();
    const currentMenu = muteMenuList.find((menu) => menu.type === type && resolveSourceInUrl(menu.source) === source);

    if (!currentMenu || currentMenu.shouldHide()) return null;

    return <MutedListPage name={currentMenu.name} type={type} source={currentMenu.source} />;
}
