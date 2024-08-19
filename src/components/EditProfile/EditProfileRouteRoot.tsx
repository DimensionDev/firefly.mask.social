import { Dialog } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Outlet, rootRouteId, useRouteContext, useRouter } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import { CloseButton } from '@/components/CloseButton.js';
import type { Profile, UpdateProfileParams } from '@/providers/types/SocialMedia.js';

export interface ProfileFormValues extends Omit<UpdateProfileParams, 'pfp'> {
    pfp?: File;
}

export function EditProfileRouteRoot() {
    const context = useRouteContext({ from: rootRouteId });
    const { history } = useRouter();

    const pathname = history.location.pathname;
    const profile = context.profile as Profile;
    const titles: Record<string, JSX.Element> = {
        '/': <Trans>Edit Profile</Trans>,
        '/pfp-editor': <Trans>Edit Image</Trans>,
    };

    const form = useForm<ProfileFormValues>({
        defaultValues: {
            displayName: profile.displayName,
            bio: profile.bio,
            website: profile.website,
            location: profile.location,
        },
        mode: 'onChange',
    });

    return (
        <div className="relative flex w-[100vw] flex-grow flex-col overflow-auto bg-lightBottom shadow-popover transition-all dark:bg-darkBottom dark:text-gray-950 md:h-auto md:max-h-[800px] md:w-[600px] md:rounded-xl lg:flex-grow-0">
            <Dialog.Title as="h3" className="relative h-14 shrink-0 pt-safe">
                {pathname === '/' ? (
                    <CloseButton
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-fourMain"
                        onClick={context.onClose}
                    />
                ) : (
                    <LeftArrowIcon
                        onClick={() => history.replace('/')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer text-fourMain"
                    />
                )}
                <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                    {titles[pathname] ?? titles['/']}
                </span>
            </Dialog.Title>
            <FormProvider {...form}>
                <Outlet />
            </FormProvider>
        </div>
    );
}
