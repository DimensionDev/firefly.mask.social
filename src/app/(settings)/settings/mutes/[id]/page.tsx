'use client';

import { find } from "lodash-es";

import { MutedListPage } from "@/app/(settings)/settings/mutes/[id]/pages/MutedListPage.js";
import { getFullMuteMenuList } from "@/helpers/getFullMuteMenuList.js";

interface PageProps {
    params: {
        id: string;
    };
}

export default function Page({ params: { id } }: PageProps) {
    const currentMenu = find(getFullMuteMenuList(), menu => menu.id === id);

    if (!currentMenu || currentMenu.disabled) {
        return null;
    }

    return (
        <MutedListPage currentMenu={currentMenu} />
    );
}
