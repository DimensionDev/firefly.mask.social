'use client';

import { createContext, type HTMLProps, type PropsWithChildren, type ReactNode, useContext, useMemo } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface TabsProps<T = string>
    extends PropsWithChildren,
        Omit<HTMLProps<HTMLDivElement>, 'onChange' | 'value'> {
    value: T;
    onChange: (value: T) => void;
    variant?: 'default' | 'second' | 'solid';
}

export interface TabContextProps {
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
            'border-b-2 text-center text-sm font-bold hover:cursor-pointer hover:text-main md:h-[60px] md:py-[18px] leading-[43px] md:leading-6 sm:text-xl h-[43px] px-4',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        second: classNames(
            'border-b-2 text-center text-sm font-bold hover:cursor-pointer hover:text-main sm:leading-5 sm:p-4 sm:pb-3 sm:text-base',
            currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
        ),
        solid: classNames(
            'px-1.5 h-6 text-xs rounded-md leading-6 bg-farcasterPrimary',
            currentTab === value
                ? 'text-bg dark:text-white'
                : 'bg-opacity-10 dark:bg-opacity-30 text-farcasterPrimary cursor-pointer dark:text-white',
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
