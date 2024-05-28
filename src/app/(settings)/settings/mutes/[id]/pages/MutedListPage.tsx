import { Suspense } from 'react';

import ComebackIcon from '@/assets/comeback.svg';
import { MutedChannels } from '@/components/Channel/MutedChannels.js';
import { Loading } from '@/components/Loading.js';
import { MutedUsers } from '@/components/Profile/MutedUsers.js';
import type { MuteMenu } from "@/helpers/getFullMuteMenuList.js";
import { useComeBack } from "@/hooks/useComeback.js";
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';


interface MutedListProps {
    currentMenu: MuteMenu;
}

export function MutedListPage({ currentMenu: { name, source, type } }: MutedListProps) {
    useNavigatorTitle(name);
    const comeback = useComeBack();

    return (
        <div
            className='p-6 md:flex-1 flex h-[calc(100vh_-_54px)] md:h-screen flex-col md:min-w-[280px]'
        >
            <div className='hidden pb-6 text-[20px] font-bold leading-[24px] text-lightMain md:flex md:items-center md:gap-6'>
                <ComebackIcon className="cursor-pointer" width={24} height={24} onClick={comeback} />
                <span>{name}</span>
            </div>
            <div className='no-scrollbar flex-1 overflow-auto'>
                <Suspense fallback={<Loading />}>
                    {
                        type === 'channel'
                            ? <MutedChannels source={source} />
                            : <MutedUsers source={source} />
                    }
                </Suspense>
            </div>
        </div>
    );
}
