import { Trans } from '@lingui/macro';
import { createRootRoute, createRoute } from '@tanstack/react-router';

import { FarcasterView, FarcasterViewBeforeLoad } from '@/modals/LoginModal/FarcasterView.js';
import { LensView } from '@/modals/LoginModal/LensView.js';
import { MainView } from '@/modals/LoginModal/MainView.js';
import { RootView } from '@/modals/LoginModal/RootView.js';
import { TwitterView } from '@/modals/LoginModal/TwitterView.js';

const rootRoute = createRootRoute({
    component: RootView,
});

const mainRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: MainView,
    path: '/main',
    beforeLoad: () => {
        return {
            title: <Trans>Login to Firefly</Trans>,
        };
    },
});

const farcasterRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: FarcasterView,
    path: '/farcaster',
    beforeLoad: FarcasterViewBeforeLoad,
});

const lensRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: LensView,
    path: '/lens',
    beforeLoad: () => {
        return {
            title: <Trans>Select Account</Trans>,
        };
    },
});

const twitterRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: TwitterView,
    path: '/twitter',
});

export const routeTree = rootRoute.addChildren([mainRoute, farcasterRoute, lensRoute, twitterRoute]);
