'use client';

import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    Outlet,
    RouterProvider,
} from '@tanstack/react-router';
import { memo } from 'react';

import { CZActivityCheckList } from '@/components/ActivityPage/CZ/CZActivityCheckList.js';
import { CZActivityHomePage } from '@/components/ActivityPage/CZ/CZActivityHomePage.js';

export const CZActivityRouter = memo(function CZActivityRouter() {
    const rootRoute = createRootRoute({
        component: Outlet,
        shouldReload: true,
    });

    const homeRoute = createRoute({
        getParentRoute: () => rootRoute,
        component: CZActivityHomePage,
        path: '/',
    });

    const checkListRoute = createRoute({
        getParentRoute: () => rootRoute,
        component: CZActivityCheckList,
        path: '/check',
    });

    const routeTree = rootRoute.addChildren([homeRoute, checkListRoute]);

    const memoryHistory = createMemoryHistory({
        initialEntries: ['/'],
    });

    const router = createRouter({
        routeTree,
        history: memoryHistory,
        defaultPendingMinMs: 0,
    });

    return <RouterProvider router={router} />;
});
