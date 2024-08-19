import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
} from '@tanstack/react-router';
import { memo } from 'react';

import { EditProfileAvatarEditor } from '@/components/EditProfile/EditProfileAvatarEditor.js';
import { EditProfileForm } from '@/components/EditProfile/EditProfileForm.js';
import { EditProfileRouteRoot } from '@/components/EditProfile/EditProfileRouteRoot.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export const EditProfileRouter = memo<{
    profile: Profile;
    onClose: () => void;
}>(function EditProfileRouter({ profile, onClose }) {
    const rootRoute = createRootRoute({
        component: EditProfileRouteRoot,
        shouldReload: true,
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

    const router = createRouter({
        routeTree,
        history: memoryHistory,
        defaultPendingMinMs: 0,
    });

    return <RouterProvider router={router} context={{ onClose, profile }} />;
});
