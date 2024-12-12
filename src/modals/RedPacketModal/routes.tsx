import { Trans } from '@lingui/macro';
import { createRootRoute, createRoute } from '@tanstack/react-router';

import { ConfirmView } from '@/modals/RedPacketModal/ConfirmView.js';
import { HistoryDetailView } from '@/modals/RedPacketModal/HistoryDetailView.js';
import { HistoryView } from '@/modals/RedPacketModal/HistoryView.js';
import { MainView } from '@/modals/RedPacketModal/MainView.js';
import { RequirementsView } from '@/modals/RedPacketModal/RequirementsView.js';
import { RootView } from '@/modals/RedPacketModal/RootView.js';

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

const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: HistoryView,
    path: '/history',
    beforeLoad: () => {
        return {
            title: <Trans>History</Trans>,
        };
    },
});

const requirementsRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: RequirementsView,
    path: '/requirements',
    beforeLoad: () => {
        return {
            title: <Trans>Claim Requirements</Trans>,
        };
    },
});

const historyDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    component: HistoryDetailView,
    path: '/detail',
    beforeLoad: () => {
        return {
            title: <Trans>More Details</Trans>,
        };
    },
});

export const routeTree = rootRoute.addChildren([
    mainRoute,
    confirmRoute,
    historyRoute,
    requirementsRoute,
    historyDetailRoute,
]);
