'use client';

import type { PropsWithChildren } from 'react';

import ComeBack from '@/assets/comeback.svg';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { PageRoute } from '@/constants/enum.js';
import { useComeBack } from '@/hooks/useComeback.js';

export function ActivityDesktopNavigationBar({ children }: PropsWithChildren) {
    const comeback = useComeBack({ defaultPath: PageRoute.Events });
    return (
        <div className="sticky top-0 z-40 flex items-center border-b border-line bg-primaryBottom px-4 py-[18px]">
            <ComeBack width={24} height={24} className="mr-8 cursor-pointer" onClick={comeback} />
            <TextOverflowTooltip content={children}>
                <h2 className="max-w-[calc(100%-24px-32px)] truncate text-xl font-black leading-6">{children}</h2>
            </TextOverflowTooltip>
        </div>
    );
}
