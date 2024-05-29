'use client';

import { find } from "lodash-es";

import { MutedListPage } from "@/app/(settings)/settings/mutes/[id]/pages/MutedListPage.js";
import type { MuteMenuId } from "@/constants/enum.js";
import { useMuteMenuList } from "@/hooks/useMuteMenuList.js";

interface PageProps {
    params: {
        id: MuteMenuId;
    };
}

export default function Page({ params: { id } }: PageProps) {
    const muteMenuList = useMuteMenuList();
    const currentMenu = find(muteMenuList, { id });

    if (!currentMenu || currentMenu.disabled) {
        return null;
    }

    return (
        <MutedListPage currentMenu={currentMenu} />
    );
}
