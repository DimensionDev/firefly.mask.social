'use client';

import { memo } from 'react';

import ComeBackIcon from '@/assets/comeback.svg';
import { classNames } from '@/helpers/classNames.js';
import { useComeBack } from '@/hooks/useComeback.js';

interface ComebackProps {
    className?: string;
}

export const Comeback = memo<ComebackProps>(function Comeback({ className }) {
    const comeback = useComeBack();

    return (
        <ComeBackIcon width={24} height={24} className={classNames('cursor-pointer', className)} onClick={comeback} />
    );
});
