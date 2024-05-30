'use client';

import { createContext, type PropsWithChildren, type ReactNode, useContext, useMemo } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface TabsProps<T = string> extends PropsWithChildren {
    value: T;
    onChange: (value: T) => void;
    variant?: 'default' | 'second';
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
    }[variant];

    return (
        <TabContext.Provider value={contextValue}>
            <nav className={classNames('flex', variantClassName)} aria-label="Tabs">
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
    const variantClassName = {
        default: 'md:h-[60px] md:py-[18px] leading-[43px] md:leading-6 sm:text-xl h-[43px] px-4',
        second: 'sm:leading-5 sm:p-4 sm:pb-3 sm:text-base',
    }[variant];

    return (
        <li className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
            <a
                className={classNames(
                    currentTab === value ? 'border-farcasterPrimary text-main' : 'border-transparent text-third',
                    'border-b-2 text-center text-sm font-bold hover:cursor-pointer hover:text-main',
                    variantClassName,
                )}
                aria-current={currentTab === value ? 'page' : undefined}
                onClick={() => onChange?.(value)}
            >
                {children}
            </a>
        </li>
    );
}
