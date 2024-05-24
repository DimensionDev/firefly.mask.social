'use client';

import { createContext, type PropsWithChildren, type ReactNode, useContext, useMemo } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface TabsProps<T = string> extends PropsWithChildren {
    value: T;
    onChange: (value: T) => void;
}

export interface TabContextProps {
    value: string;
    onChange: (value: string) => void;
}

const TabContext = createContext<TabContextProps>({
    value: '',
    onChange: (tab: string) => {
        throw new Error('The `TabContext` is error');
    },
});

export function Tabs<T = string>(props: TabsProps<T>) {
    const { value, onChange, children } = props;
    const contextValue = useMemo(() => {
        return {
            onChange,
            value: value as string,
        } as TabContextProps;
    }, [value, onChange]);

    return (
        <TabContext.Provider value={contextValue}>
            <nav className="flex space-x-4" aria-label="Tabs">
                {children}
            </nav>
        </TabContext.Provider>
    );
}

export function Tab({ children, value }: { children: ReactNode; value: string }) {
    const { value: currentTab, onChange } = useContext(TabContext);

    return (
        <li className="flex flex-1 list-none justify-center lg:flex-initial lg:justify-start">
            <a
                className={classNames(
                    currentTab === value ? 'border-b-2 border-farcasterPrimary text-main' : 'text-third',
                    'h-[43px] px-4 text-center text-sm font-bold leading-[43px] hover:cursor-pointer hover:text-main sm:text-xl',
                    'md:h-[60px] md:py-[18px] md:leading-6',
                )}
                aria-current={currentTab === value ? 'page' : undefined}
                onClick={() => onChange?.(value)}
            >
                {children}
            </a>
        </li>
    );
}
