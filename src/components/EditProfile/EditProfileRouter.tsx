import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { EditProfileAvatarEditor } from '@/components/EditProfile/EditProfileAvatarEditor.js';
import { EditProfileForm } from '@/components/EditProfile/EditProfileForm.js';
import { EditProfileRouteRoot } from '@/components/EditProfile/EditProfileRouteRoot.js';

const rootRoute = createRootRoute({
    component: EditProfileRouteRoot,
});

const formRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: EditProfileForm,
});

const pfpEditor = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pfp-editor',
    component: EditProfileAvatarEditor,
});

const routeTree = rootRoute.addChildren([formRoute, pfpEditor]);

const memoryHistory = createMemoryHistory({
    initialEntries: ['/'],
});

export const router = createRouter({
    routeTree,
    history: memoryHistory,
    defaultPendingMinMs: 0,
});
