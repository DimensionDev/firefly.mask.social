'use client';

import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { Headline } from '@/app/(settings)/components/Headline.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { ProfileAvatar } from '@/components/ProfileAvatar.js';
import { ProfileName } from '@/components/ProfileName.js';

export default function Page() {
    const [serializedSession, setSerializedSession] = useState('');
    const [profile, setProfile] = useState<Profile>();

    const [{ error, loading }, onSubmit] = useAsyncFn(async () => {
        const session = SessionFactory.createSession(serializedSession);
        const provider = resolveSocialMediaProvider(resolveSocialSourceFromSessionType(session.type));

        const profile =
            session.type === SessionType.Lens
                ? await provider.getProfileByHandle(session.profileId as string)
                : await provider.getProfileById(session.profileId as string);
        if (!profile) throw new Error(t`Failed to fetch profile.`);

        setProfile(profile);
    }, [serializedSession]);

    return (
        <Section>
            <Headline>
                <Trans>Session Validator</Trans>
            </Headline>

            <div className="mb-2 w-full">
                <Trans>Please input the serialized session to be validated.</Trans>
            </div>

            <div className="mb-2 flex w-full flex-row gap-2">
                <input
                    className="flex-1 rounded-md border border-line bg-transparent"
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={t`Your serialized session`}
                    onChange={(e) => setSerializedSession(e.target.value)}
                />
                <ClickableButton
                    className={classNames(
                        'flex h-[42px] w-[42px] items-center justify-center rounded-md border border-line',
                        {
                            'text-primaryMain': loading,
                            'hover:cursor-pointer': !loading,
                            'hover:text-secondary': !loading,
                        },
                    )}
                    disabled={loading || !serializedSession}
                    onClick={onSubmit}
                >
                    <ArrowPathRoundedSquareIcon width={24} height={24} />
                </ClickableButton>
            </div>
            {profile ? (
                <div className="inline-flex w-full items-center justify-start gap-3 rounded-lg bg-white bg-bottom px-3 py-2 shadow-primary backdrop-blur dark:bg-bg">
                    <ProfileAvatar profile={profile} size={36} />
                    <ProfileName profile={profile} />
                </div>
            ) : null}
            {error ? <div className="w-full">{error.message}</div> : null}
        </Section>
    );
}
