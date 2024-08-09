import { Trans } from '@lingui/macro';
import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { ComposeRouteRoot } from '@/components/Compose/ComposeRouteRoot.js';
import { ComposeUI, Title } from '@/components/Compose/ComposeUI.js';
import { DraftPage } from '@/components/Compose/DraftPage.js';
import { GifSelector } from '@/components/Gif/GifSelector.js';

const rootRoute = createRootRoute({
    component: ComposeRouteRoot,
});

const composeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: ComposeUI,
    beforeLoad: () => ({
        title: <Title />,
    }),
});

const draftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'draft',
    component: DraftPage,
    beforeLoad: () => ({
        title: <Trans>Drafts</Trans>,
    }),
});

const gifRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'gif',
    component: () => <GifSelector onSelected={() => router.navigate({ to: '/', replace: true })} />,
    beforeLoad: () => ({
        title: <Trans>GIFs</Trans>,
    }),
});

const routeTree = rootRoute.addChildren([composeRoute, draftRoute, gifRoute]);

const memoryHistory = createMemoryHistory({
    initialEntries: ['/'],
});

export const router = createRouter({
    routeTree,
    history: memoryHistory,
});
