import { t, Trans } from '@lingui/macro';
import { rootRouteId, useMatch, useRouter } from '@tanstack/react-router';
import { useFormContext } from 'react-hook-form';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { EditProfileAvatar } from '@/components/EditProfile/EditProfileAvatar.js';
import type { ProfileFormValues } from '@/components/EditProfile/EditProfileRouteRoot.js';
import { ErrorMessage } from '@/components/Form/ErrorMessage.js';
import { FormInput } from '@/components/Form/FormInput.js';
import { FormInputContainer } from '@/components/Form/FormInputContainer.js';
import { FormTextarea } from '@/components/Form/FormTextarea.js';
import { Source } from '@/constants/enum.js';
import {
    ALLOWED_IMAGES_MIMES,
    MAX_PROFILE_BIO_SIZE,
    MAX_PROFILE_DISPLAY_NAME_SIZE,
    MAX_PROFILE_LOCATION_SIZE,
    MAX_PROFILE_WEBSITE_SIZE,
} from '@/constants/index.js';
import { URL_INPUT_REGEX } from '@/constants/regexp.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { resolveLengthCalculator } from '@/services/resolveLengthCalculator.js';
import { updateProfile } from '@/services/updateProfile.js';
import { uploadProfileAvatar } from '@/services/uploadProfileAvatar.js';

export function EditProfileForm() {
    const { context } = useMatch({ from: rootRouteId });
    const { profile, onClose } = context as { profile: Profile; onClose?: () => void };
    const form = useFormContext<ProfileFormValues>();
    const { history } = useRouter();

    const {
        handleSubmit,
        formState: { isSubmitting, isDirty, isValid },
    } = form;

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            const pfp = values.pfp ? await uploadProfileAvatar(profile.source, values.pfp) : profile.pfp;
            await updateProfile(profile, { ...values, pfp });
            onClose?.();
            enqueueSuccessMessage(t`Updated profile successfully`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to update profile.`), {
                error,
            });
            throw error;
        }
    };

    const resolveLengthCalculatorFn = resolveLengthCalculator(profile.source);
    const maxDisplayNameSize = MAX_PROFILE_DISPLAY_NAME_SIZE[profile.source] ?? 0;
    const maxLocationSize = MAX_PROFILE_LOCATION_SIZE[profile.source] ?? 0;
    const maxWebsiteSize = MAX_PROFILE_WEBSITE_SIZE[profile.source] ?? 0;
    const maxBioSize = MAX_PROFILE_BIO_SIZE[profile.source] ?? 0;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-1 flex-col text-left">
            <div className="mb-12 flex flex-col gap-4 p-4">
                <div className="flex w-full items-center gap-4">
                    <EditProfileAvatar pfp={profile.pfp} name="pfp" />
                    <div className="flex flex-col space-y-2 text-left text-main">
                        <div className="text-[20px] font-bold">@{profile.handle}</div>
                        <label
                            htmlFor="pfp-upload"
                            className="text-md block cursor-pointer rounded-lg font-bold leading-5 text-lightHighlight"
                        >
                            <Trans>Upload photo</Trans>
                        </label>
                        <input
                            id="pfp-upload"
                            type="file"
                            className="hidden"
                            accept={ALLOWED_IMAGES_MIMES.join(', ')}
                            onChange={(e) => {
                                history.replace('/pfp-editor', {
                                    pfp: e.target.files,
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex w-full flex-row items-center space-x-1">
                        <label className="min-w-[110px] text-sm font-bold text-main">
                            <Trans>Display Name</Trans>
                        </label>
                        <FormInputContainer name="displayName" className="flex-1">
                            <FormInput
                                name="displayName"
                                options={{
                                    required: true,
                                    minLength: {
                                        value: 1,
                                        message: t`Display Name should not be blank`,
                                    },
                                    validate(value: string) {
                                        if (resolveLengthCalculatorFn(value) > maxDisplayNameSize) {
                                            return t`Display Name should not exceed ${maxDisplayNameSize} characters`;
                                        }
                                        return true;
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
                            <FormInputContainer name="website" className="flex-1">
                                <FormInput
                                    name="website"
                                    options={{
                                        pattern: {
                                            value: URL_INPUT_REGEX,
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
                            <FormInputContainer name="location" className="flex-1">
                                <FormInput
                                    name="location"
                                    options={{
                                        validate(value: string) {
                                            if (resolveLengthCalculatorFn(value) > maxLocationSize) {
                                                return t`Location should not exceed ${maxLocationSize} characters`;
                                            }
                                            return true;
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
                        <FormInputContainer name="bio" className="h-[100px] flex-1">
                            <FormTextarea
                                name="bio"
                                className="h-[100px] resize-none"
                                options={{
                                    validate(value: string) {
                                        if (resolveLengthCalculatorFn(value) > maxBioSize) {
                                            return t`Bio should not exceed ${maxBioSize} characters`;
                                        }
                                        return true;
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
                    className="flex h-10 w-[84px] items-center justify-center rounded-full bg-main text-medium font-bold leading-10 text-primaryBottom"
                >
                    {isSubmitting ? (
                        <LoadingIcon width={16} height={16} className="animate-spin" />
                    ) : (
                        <Trans>Save</Trans>
                    )}
                </ClickableButton>
            </div>
        </form>
    );
}
