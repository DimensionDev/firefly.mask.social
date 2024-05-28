
import { filter } from 'lodash-es';

import { getFullMuteMenuList, type MuteMenu } from '@/helpers/getFullMuteMenuList.js';
import { useCurrentProfileAll } from "@/hooks/useCurrentProfileAll.js";

export const useMuteMenuList = (): MuteMenu[] => {
    const profiles = useCurrentProfileAll();

    return filter(getFullMuteMenuList(), (menu) => !!profiles[menu.source] && !menu.disabled);
};
