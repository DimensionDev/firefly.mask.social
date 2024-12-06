import { Trans } from '@lingui/macro';
import { createRootRoute, createRoute } from '@tanstack/react-router';

import { ConfirmView } from '@/modals/RedpacketModal/ConfirmView.js';
import { MainView } from '@/modals/RedpacketModal/MainView.js';
import { RootView } from '@/modals/RedpacketModal/RootView.js';

const rootRoute = createRootRoute({
    component: RootView,
});

const mainRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: MainView,
    path: '/main',
    beforeLoad: () => {
        return {
            title: <Trans>Lucky drop</Trans>,
        };
    },
});

const confirmRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: ConfirmView,
    path: '/confirm',
    beforeLoad: () => {
        return {
            title: <Trans>Confirm Lucky drop</Trans>,
        };
    },
});

export const routeTree = rootRoute.addChildren([mainRoute, confirmRoute]);
