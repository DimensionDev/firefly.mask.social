'use client';

import React, { type ButtonHTMLAttributes } from 'react';

import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface OptionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    darkMode?: boolean;
    selected: boolean;
    label: React.ReactNode;
    onClick?: () => void;
}

export function OptionButton({ darkMode = false, selected, label, onClick, ...props }: OptionButtonProps) {
    return (
        <ClickableButton
            className={classNames(
                `inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg px-3 ${
                    darkMode
                        ? 'border border-line bg-darkBottom text-white'
                        : 'border border-neutral-900 bg-white text-slate-950'
                }`,
                props.className,
            )}
            onClick={() => onClick?.()}
        >
            <div className="flex items-center gap-5">
                {selected ? (
                    <div
                        className="h-2 w-2 rounded-full bg-success"
                        style={{ filter: 'drop-shadow(0px 4px 10px var(--color-success))' }}
                    />
                ) : (
                    <div className="h-2 w-2" />
                )}
                <div className="text-medium font-bold leading-[18px]">{label}</div>
            </div>
        </ClickableButton>
    );
}
