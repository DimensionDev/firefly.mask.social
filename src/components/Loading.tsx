'use client';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';

interface LoadingProps {
    className?: string;
}

export function Loading({ className }: LoadingProps) {
    return (
        <div className={classNames('flex min-h-[500px] items-center justify-center', className)}>
            <LoadingIcon className="animate-spin" width={24} height={24} />
        </div>
    );
}
