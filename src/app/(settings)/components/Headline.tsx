import type { HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface HeadlineProps extends HTMLProps<HTMLDivElement> {}

export function Headline({ className, children }: HeadlineProps) {
    return (
        <div className={classNames('hidden w-full items-center justify-between gap-6 md:flex', className)}>
            <span className="text-[20px] font-bold leading-[24px] text-main">{children}</span>
        </div>
    );
}
