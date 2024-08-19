import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { Loading } from '@/components/Loading.js';
import { NoAvailableWallet } from '@/components/Tips/NoAvailableWallet.js';
import { TipsModalHeader } from '@/components/Tips/TipsModalHeader.js';
import { TipSuccess } from '@/components/Tips/TipSuccess.js';
import { TipsUI } from '@/components/Tips/TipsUI.js';
import { TokenSelector } from '@/components/Tips/TokenSelector.js';

export enum TipsRoutePath {
    TIPS = '/tips',
    NO_AVAILABLE_WALLET = '/no-available-wallet',
    SELECT_TOKEN = '/select-token',
    LOADING = '/',
    SUCCESS = '/success',
}

const tipsRootRoute = createRootRoute({
    component: () => <Outlet />,
});

const noAvailableWalletRoute = createRoute({
    getParentRoute: () => tipsRootRoute,
    path: TipsRoutePath.NO_AVAILABLE_WALLET,
    component: NoAvailableWallet,
});

const tipsRoute = createRoute({
    getParentRoute: () => tipsRootRoute,
    path: TipsRoutePath.TIPS,
    component: TipsUI,
});

const tokenSelectRoute = createRoute({
    getParentRoute: () => tipsRootRoute,
    path: TipsRoutePath.SELECT_TOKEN,
    component: TokenSelector,
});

const loadingRoute = createRoute({
    getParentRoute: () => tipsRootRoute,
    path: TipsRoutePath.LOADING,
    component: () => (
        <>
            <TipsModalHeader />
            <Loading className="!min-h-[156px]" />
        </>
    ),
});

const successRoute = createRoute({
    getParentRoute: () => tipsRootRoute,
    path: TipsRoutePath.SUCCESS,
    component: TipSuccess,
});

const routeTree = tipsRootRoute.addChildren([
    tipsRoute,
    noAvailableWalletRoute,
    tokenSelectRoute,
    loadingRoute,
    successRoute,
]);

const memoryHistory = createMemoryHistory({
    initialEntries: [TipsRoutePath.TIPS],
});

export const router = createRouter({
    routeTree,
    history: memoryHistory,
    defaultPendingMinMs: 0,
});
