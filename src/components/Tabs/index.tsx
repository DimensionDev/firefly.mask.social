'use client';

import { createContext, type HTMLProps, type PropsWithChildren, useContext, useMemo } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface TabsProps<T = string> extends PropsWithChildren, Omit<HTMLProps<HTMLDivElement>, 'onChange' | 'value'> {
    value: T;
    onChange: (value: T) => void;
    variant?: 'default' | 'second' | 'solid';
}

interface TabContextProps {
    value: string;
    onChange: (value: string) => void;
    variant: NonNullable<TabsProps['variant']>;
}

const TabContext = createContext<TabContextProps>({
    value: '',
    onChange: (tab: string) => {
        throw new Error('The `TabContext` is error');
    },
    variant: 'default',
});

export function Tabs<T = string>(props: TabsProps<T>) {
    const { value, onChange, children, variant = 'default' } = props;
    const contextValue = useMemo(() => {
        return {
            onChange,
            value: value as string,
            variant,
        } as TabContextProps;
    }, [onChange, value, variant]);
    const variantClassName = {
        default: 'space-x-4',
        second: 'space-x-0',
        solid: 'space-x-0 border border-secondaryLine py-1 px-[5px] rounded-[6px] min-w-0',
    }[variant];

    return (
        <TabContext.Provider value={contextValue}>
            <nav className={classNames('flex', variantClassName, props.className)} aria-label="Tabs">
                {children}
            </nav>
        </TabContext.Provider>
    );
}

export interface TabProps extends HTMLProps<HTMLLIElement> {
    value: string;
    disabled?: boolean;
}

export function Tab({ children, value, className, disabled, ...props }: TabProps) {
    const { value: currentTab, onChange, variant } = useContext(TabContext);
    const liVariantClassName = {
        default: 'flex-1 text-sm sm:text-xl',
        second: 'flex-1 text-sm sm:text-base',
        solid: 'text-[14px] leading-[20px]',
    }[variant];
    const variantClassName = {
        default: classNames(
            'h-[43px] border-b-2 px-4 text-center font-bold leading-[43px] hover:cursor-pointer hover:text-main md:h-[60px] md:py-[18px] md:leading-6',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        second: classNames(
            'border-b-2 text-center font-bold hover:cursor-pointer hover:text-main sm:p-4 sm:pb-3 sm:leading-5',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        solid: classNames(
            'h-8 rounded-[4px] px-[12px] py-[6px] transition-colors hover:text-highlight',
            currentTab === value ? 'bg-bg text-highlight' : 'cursor-pointer text-lightSecond',
        ),
    }[variant];

    return (
        <li
            className={classNames(
                'flex list-none justify-center lg:flex-initial lg:justify-start',
                {
                    'opacity-40': !!disabled,
                },
                liVariantClassName,
                className,
            )}
            {...props}
        >
            <a
                className={variantClassName}
                aria-current={currentTab === value ? 'page' : undefined}
                onClick={() => {
                    if (disabled) return;
                    onChange?.(value);
                }}
            >
                {children}
            </a>
        </li>
    );
}
