'use client';

import { createContext, type HTMLProps, type PropsWithChildren, type ReactNode, useContext, useMemo } from 'react';

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
        solid: 'space-x-2',
    }[variant];

    return (
        <TabContext.Provider value={contextValue}>
            <nav className={classNames('flex', variantClassName, props.className)} aria-label="Tabs">
                {children}
            </nav>
        </TabContext.Provider>
    );
}

export interface TabProps {
    children: ReactNode;
    value: string;
}

export function Tab({ children, value }: TabProps) {
    const { value: currentTab, onChange, variant } = useContext(TabContext);
    const liVariantClassName = {
        default: 'flex-1',
        second: 'flex-1',
        solid: '',
    }[variant];
    const variantClassName = {
        default: classNames(
            'h-[43px] border-b-2 px-4 text-center text-sm font-bold leading-[43px] hover:cursor-pointer hover:text-main sm:text-xl md:h-[60px] md:py-[18px] md:leading-6',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        second: classNames(
            'border-b-2 text-center text-sm font-bold hover:cursor-pointer hover:text-main sm:p-4 sm:pb-3 sm:text-base sm:leading-5',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        solid: classNames(
            'h-6 rounded-md bg-farcasterPrimary px-1.5 text-xs leading-6',
            currentTab === value
                ? 'text-bg dark:text-white'
                : 'cursor-pointer bg-opacity-10 text-farcasterPrimary dark:bg-opacity-30 dark:text-white',
        ),
    }[variant];

    return (
        <li
            className={classNames('flex list-none justify-center lg:flex-initial lg:justify-start', liVariantClassName)}
        >
            <a
                className={variantClassName}
                aria-current={currentTab === value ? 'page' : undefined}
                onClick={() => onChange?.(value)}
            >
                {children}
            </a>
        </li>
    );
}
