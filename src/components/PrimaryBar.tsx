'use client';

import type React from 'react';
import { classNames } from '@/helpers/classNames.js';

export interface PrimaryBarProps {
    children: React.ReactNode;
}

export function PrimaryBar({ children }: { children: React.ReactNode }) {
    return (
        <main
            className={classNames({
                // lg
                ['lg:pl-72 lg:pr-96']: true,
            })}
        >
            {children}
        </main>
    );
}
