import { safeUnreachable } from '@masknet/kit';
import { Suspense } from 'react';

import { MutedWallets } from '@/app/(settings)/components/MutedWallets.js';
import ComebackIcon from '@/assets/comeback.svg';
import { MutedChannels } from '@/components/Channel/MutedChannels.js';
import { Loading } from '@/components/Loading.js';
import { MutedProfiles } from '@/components/Profile/MutedProfiles.js';
import { MuteType, Source } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { useComeBack } from '@/hooks/useComeback.js';

interface MutedListProps {
    name: string;
    type: MuteType;
    source: Source;
}

function MutedContent({ type, source }: { type: MuteType; source: Source }) {
    const socialSource = narrowToSocialSource(source);

    switch (type) {
        case MuteType.Channel:
            return <MutedChannels source={socialSource} />;
        case MuteType.Profile:
            return <MutedProfiles source={socialSource} />;
        case MuteType.Wallet:
            return <MutedWallets />;
        default:
            safeUnreachable(type);
            return null;
    }
}

export function MutedListPage({ name, type, source }: MutedListProps) {
    const comeback = useComeBack();

    return (
        <div className="flex h-[calc(100vh_-_54px)] flex-col p-6 md:h-screen md:min-w-[280px] md:flex-1">
            <div className="hidden pb-6 text-[20px] font-bold leading-[24px] text-lightMain md:flex md:items-center md:gap-6">
                <ComebackIcon className="cursor-pointer" width={24} height={24} onClick={comeback} />
                <span>{name}</span>
            </div>
            <div className="no-scrollbar flex-1 overflow-auto">
                <Suspense fallback={<Loading />}>
                    <MutedContent type={type} source={source} />
                </Suspense>
            </div>
        </div>
    );
}
