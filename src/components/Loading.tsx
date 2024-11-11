'use client';

import type { HTMLProps } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import { classNames } from '@/helpers/classNames.js';

interface LoadingProps extends HTMLProps<HTMLDivElement> {
    tag?: string;
}

export function Loading({ tag, className }: LoadingProps) {
    return (
        <div className={classNames('flex min-h-[500px] items-center justify-center', className)}>
            <LoadingIcon className="animate-spin" width={24} height={24} />
            {tag ? <span className="text-lg font-bold text-danger">{tag}</span> : null}
        </div>
    );
}
