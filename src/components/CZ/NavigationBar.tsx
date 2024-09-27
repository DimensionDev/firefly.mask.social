import type { HTMLProps, ReactNode } from 'react';

import NavigationBarBackIcon from '@/assets/navigation-bar-back.svg';
import { classNames } from '@/helpers/classNames.js';

interface Props extends HTMLProps<'div'> {
    right?: ReactNode;
    onBack?: () => void;
}

export function NavigationBar({ children, right, className, onBack }: Props) {
    return (
        <div
            className={classNames(
                'sticky top-0 grid h-[44px] grid-cols-[24px_1fr_24px] items-center justify-between px-4 text-center text-lg font-bold',
                className,
            )}
        >
            <button className="h-6 w-6 cursor-pointer" onClick={onBack}>
                <NavigationBarBackIcon width={24} height={24} />
            </button>
            <p className="w-full min-w-0 truncate">{children}</p>
            {right}
        </div>
    );
}
