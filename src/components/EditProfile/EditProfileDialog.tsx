import { Dialog } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { CloseButton } from '@/components/CloseButton.js';
import { EditingProfileAvatar } from '@/components/EditProfile/EditingProfileAvatar.js';
import { ErrorMessage } from '@/components/Form/ErrorMessage.js';
import { FormInput } from '@/components/Form/FormInput.js';
import { FormInputContainer } from '@/components/Form/FormInputContainer.js';
import { FormTextarea } from '@/components/Form/FormTextarea.js';
import { Modal } from '@/components/Modal.js';
import { Source } from '@/constants/enum.js';
import {
    MAX_PROFILE_BIO_SIZE,
    MAX_PROFILE_DISPLAY_NAME_SIZE,
    MAX_PROFILE_LOCATION_SIZE,
    MAX_PROFILE_WEBSITE_SIZE,
} from '@/constants/index.js';
import { URL_REGEX } from '@/constants/regexp.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { Profile, UpdateProfileParams } from '@/providers/types/SocialMedia.js';
import { updateProfile } from '@/services/updateProfile.js';
import { uploadProfileAvatar } from '@/services/uploadProfileAvatar.js';

export interface ProfileFormValues extends Omit<UpdateProfileParams, 'avatar'> {
    avatar?: FileList;
}

export function EditProfileDialog({
    profile,
    onClose,
    open,
}: {
    profile: Profile;
    onClose: () => void;
    open: boolean;
}) {
    const form = useForm<ProfileFormValues>({
        defaultValues: {
            displayName: profile.displayName,
            bio: profile.bio,
            website: profile.website,
            location: profile.location,
        },
        mode: 'onChange',
    });
    const {
        handleSubmit,
        formState: { isSubmitting, isDirty, isValid },
        register,
    } = form;
    useEffect(() => {
        if (open) {
            form.setValue('displayName', profile.displayName);
            if (profile.bio) form.setValue('bio', profile.bio);
            if (profile.website) form.setValue('website', profile.website);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, profile.source]);

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            const avatarFile =
                values.avatar instanceof FileList && values.avatar.length > 0 ? values.avatar[0] : undefined;
            const avatar = avatarFile ? await uploadProfileAvatar(profile.source, avatarFile) : profile.pfp;
            await updateProfile(profile, { ...values, avatar });
            onClose();
            enqueueSuccessMessage(t`Updated profile successfully`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to update profile.`), {
                error,
            });
        }
    };

    const maxDisplayNameSize = MAX_PROFILE_DISPLAY_NAME_SIZE[profile.source] ?? 0;
    const maxLocationSize = MAX_PROFILE_LOCATION_SIZE[profile.source] ?? 0;
    const maxWebsiteSize = MAX_PROFILE_WEBSITE_SIZE[profile.source] ?? 0;
    const maxBioSize = MAX_PROFILE_BIO_SIZE[profile.source] ?? 0;

    return (
        <Modal open={open} onClose={onClose} className="flex-col" disableScrollLock={false} disableDialogClose>
            <div className="relative flex w-[100vw] flex-grow flex-col overflow-auto bg-lightBottom shadow-popover transition-all dark:bg-darkBottom dark:text-gray-950 md:h-auto md:max-h-[800px] md:w-[600px] md:rounded-xl lg:flex-grow-0">
                <Dialog.Title as="h3" className="relative h-14 shrink-0 pt-safe">
                    <CloseButton className="absolute left-4 top-1/2 -translate-y-1/2 text-fourMain" onClick={onClose} />
                    <span className="flex h-full w-full items-center justify-center gap-x-1 text-lg font-bold capitalize text-fourMain">
                        <Trans>Edit Profile</Trans>
                    </span>
                </Dialog.Title>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-1 flex-col text-left">
                        <div className="mb-12 flex flex-col gap-4 p-4">
                            <div className="flex w-full items-center gap-4">
                                <EditingProfileAvatar pfp={profile.pfp} name="avatar" />
                                <div className="flex flex-col space-y-2 text-left text-main">
                                    <div className="text-[20px] font-bold">@{profile.handle}</div>
                                    <label
                                        htmlFor="avatar-upload-input"
                                        className="text-md block cursor-pointer rounded-lg font-bold leading-5 text-lightHighlight"
                                    >
                                        <Trans>Upload photo</Trans>
                                    </label>
                                    <input
                                        id="avatar-upload-input"
                                        type="file"
                                        className="hidden"
                                        {...register('avatar')}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex w-full flex-row items-center space-x-1">
                                    <label className="min-w-[110px] text-sm font-bold text-main">
                                        <Trans>Display Name</Trans>
                                    </label>
                                    <FormInputContainer
                                        name="displayName"
                                        maxLength={maxDisplayNameSize}
                                        className="flex-1"
                                    >
                                        <FormInput
                                            name="displayName"
                                            options={{
                                                required: true,
                                                minLength: {
                                                    value: 1,
                                                    message: t`Display Name should not be blank`,
                                                },
                                                maxLength: {
                                                    value: maxDisplayNameSize,
                                                    message: t`Display Name should not exceed ${maxDisplayNameSize} characters`,
                                                },
                                            }}
                                        />
                                    </FormInputContainer>
                                </div>
                                <ErrorMessage name="displayName" className="ml-[114px]" />
                            </div>

                            {profile.source !== Source.Farcaster ? (
                                <div className="space-y-1.5">
                                    <div className="flex w-full flex-row items-center space-x-1">
                                        <label className="min-w-[110px] text-sm font-bold text-main">
                                            <Trans>Website</Trans>
                                        </label>
                                        <FormInputContainer
                                            name="website"
                                            maxLength={maxWebsiteSize}
                                            className="flex-1"
                                        >
                                            <FormInput
                                                name="website"
                                                options={{
                                                    pattern: {
                                                        value: URL_REGEX,
                                                        message: t`Invalid website format`,
                                                    },
                                                    maxLength: {
                                                        value: maxWebsiteSize,
                                                        message: t`Website should not exceed ${maxWebsiteSize} characters`,
                                                    },
                                                }}
                                            />
                                        </FormInputContainer>
                                    </div>
                                    <ErrorMessage name="website" className="ml-[114px]" />
                                </div>
                            ) : null}

                            {profile.source !== Source.Farcaster ? (
                                <div className="space-y-1.5">
                                    <div className="flex w-full flex-row items-center space-x-1">
                                        <label className="min-w-[110px] text-sm font-bold text-main">
                                            <Trans>Location</Trans>
                                        </label>
                                        <FormInputContainer
                                            name="location"
                                            maxLength={maxLocationSize}
                                            className="flex-1"
                                        >
                                            <FormInput
                                                name="location"
                                                options={{
                                                    maxLength: {
                                                        value: maxLocationSize,
                                                        message: t`Location should not exceed ${maxLocationSize} characters`,
                                                    },
                                                }}
                                            />
                                        </FormInputContainer>
                                    </div>
                                    <ErrorMessage name="location" className="ml-[114px]" />
                                </div>
                            ) : null}

                            <div className="space-y-1.5">
                                <div className="flex w-full flex-row items-start space-x-1">
                                    <label className="leading-12 h-12 min-w-[110px] text-sm font-bold text-main">
                                        <Trans>Bio</Trans>
                                    </label>
                                    <FormInputContainer name="bio" maxLength={maxBioSize} className="h-[100px] flex-1">
                                        <FormTextarea
                                            name="bio"
                                            className="h-[100px] resize-none"
                                            options={{
                                                maxLength: {
                                                    value: maxBioSize,
                                                    message: t`Bio should not exceed ${maxBioSize} characters`,
                                                },
                                            }}
                                        />
                                    </FormInputContainer>
                                </div>
                                <ErrorMessage name="bio" className="ml-[114px]" />
                            </div>
                        </div>
                        <div className="mt-auto flex w-full justify-end p-4 shadow-accountCardShadowLight">
                            <ClickableButton
                                enableDefault
                                enablePropagate
                                type="submit"
                                disabled={!isDirty || !isValid || isSubmitting}
                                className="flex h-10 w-[84px] items-center justify-center rounded-full bg-main text-[15px] font-bold leading-10 text-primaryBottom"
                            >
                                {isSubmitting ? (
                                    <LoadingIcon width={16} height={16} className="animate-spin" />
                                ) : (
                                    <Trans>Save</Trans>
                                )}
                            </ClickableButton>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </Modal>
    );
}
