'use client';

import React, { useState } from 'react';
import {
    CalendarIcon,
    ChartPieIcon,
    DocumentDuplicateIcon,
    FolderIcon,
    HomeIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { NavigationItem } from '@/types';
import { SidebarForMobile } from '@/components/SidebarForMobile';
import { SidebarForDesktop } from '@/components/SidebarForDesktop';
import { Heading } from '@/components/Heading';
import { classNames } from '@/helpers/classNames';

const items: NavigationItem[] = [
    { id: 'dashboard', name: 'Dashboard', href: '#', icon: HomeIcon },
    { id: 'team', name: 'Team', href: '#', icon: UsersIcon },
    { id: 'projects', name: 'Projects', href: '#', icon: FolderIcon },
    { id: 'calendar', name: 'Calendar', href: '#', icon: CalendarIcon },
    { id: 'documents', name: 'Documents', href: '#', icon: DocumentDuplicateIcon },
    { id: 'reports', name: 'Reports', href: '#', icon: ChartPieIcon },
];

export interface LayoutProps {
    MainArea?: React.ReactNode;
    SecondaryColumn?: React.ReactNode;
}

export function Layout(props: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div
            className={classNames({
                // global
                'relative m-auto h-screen bg-white': true,

                // sm
                [`sm:w-full`]: true,

                // lg
                [`lg:w-[1265px]`]: true,
            })}
        >
            <SidebarForMobile items={items} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SidebarForDesktop items={items} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <Heading title="Timeline" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main
                className={classNames({
                    // lg
                    ['lg:pl-72 lg:pr-96']: true,
                })}
            >
                <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{props.MainArea}</div>
            </main>

            <aside className="absolute inset-y-0 right-0 hidden w-96 overflow-y-auto border-l border-gray-200 px-4 py-6 sm:px-6 lg:px-8 lg:block">
                {props.SecondaryColumn}
            </aside>
        </div>
    );
}
