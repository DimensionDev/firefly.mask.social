import { Suspense } from 'react';

import ComebackIcon from '@/assets/comeback.svg';
import { MutedChannels } from '@/components/Channel/MutedChannels.js';
import { Loading } from '@/components/Loading.js';
import { MutedProfiles } from '@/components/Profile/MutedProfiles.js';
import { useComeBack } from "@/hooks/useComeback.js";
import { type MuteMenu } from '@/hooks/useMuteMenuList.js';


interface MutedListProps {
    currentMenu: MuteMenu;
}

export function MutedListPage({ currentMenu: { name, type, source } }: MutedListProps) {
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
                            : <MutedProfiles source={source} />
                    }
                </Suspense>
            </div>
        </div>
    );
}
