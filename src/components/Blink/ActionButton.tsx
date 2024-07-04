import { type ReactNode, useMemo } from 'react';

import CheckIcon from '@/assets/check.svg';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';

export interface ButtonProps {
    text: ReactNode;
    loading?: boolean;
    variant?: 'default' | 'success' | 'error';
    disabled?: boolean;
    onClick: (params?: Record<string, string>) => void;
}

export function ActionButton({ text, loading, disabled, variant, onClick }: ButtonProps) {
    const content = useMemo(() => {
        if (loading)
            return (
                <span className="flex flex-row items-center justify-center gap-2">
                    {text} <LoadingIcon width={16} height={16} className="animate-spin" />
                </span>
            );
        if (variant === 'success')
            return (
                <span className="flex flex-row items-center justify-center gap-2">
                    {text}
                    <CheckIcon width={16} height={16} className="h-4 w-4" />
                </span>
            );
        return text;
    }, [loading, variant, text]);

    return (
        <ClickableButton
            className="flex h-10 w-full items-center justify-center rounded-full bg-main px-5 text-sm font-bold leading-10 text-primaryBottom"
            disabled={disabled}
            onClick={() => onClick()}
        >
            {content}
        </ClickableButton>
    );
}
