'use client';

import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { Appearance } from '@masknet/public-api';
import { useMemo } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { changeLocale } from '@/actions/changeLocale.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { OptionButton } from '@/app/(settings)/components/OptionButton.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { Subtitle } from '@/app/(settings)/components/Subtitle.js';
import { Locale } from '@/constants/enum.js';
import { getLocaleFromCookies } from '@/helpers/getLocaleFromCookies.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { supportedLocales } from '@/i18n/index.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export default function General() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const locale = useMemo(() => getLocaleFromCookies(), []);

    useNavigatorTitle(t`General`);

    return (
        <Section>
            <Headline>
                <Trans>General</Trans>
            </Headline>

            <Subtitle>
                <Trans>Display</Trans>
            </Subtitle>

            <div className="flex flex-col gap-5">
                {[
                    {
                        value: Appearance.default,
                        label: <Trans>Follow System</Trans>,
                    },
                    {
                        value: Appearance.light,
                        label: <Trans>Light Mode</Trans>,
                    },
                    {
                        value: Appearance.dark,
                        label: <Trans>Dark Mode</Trans>,
                    },
                ].map((option, index) => (
                    <OptionButton
                        key={index}
                        darkMode={option.value === Appearance.default ? isDarkOS : option.value === Appearance.dark}
                        selected={mode === option.value}
                        label={option.label}
                        onClick={() => {
                            setThemeMode(option.value);
                        }}
                    />
                ))}
            </div>

            <Subtitle>
                <Trans>Language</Trans>
            </Subtitle>

            <div className="flex flex-col gap-5">
                {getEnumAsArray(Locale).map((option, index) => (
                    <OptionButton
                        key={index}
                        selected={option.value === locale}
                        darkMode={mode === Appearance.default ? isDarkOS : mode === Appearance.dark}
                        label={supportedLocales[option.value]}
                        onClick={async () => {
                            const data = new FormData();
                            data.append('locale', option.value);
                            await changeLocale(data);
                        }}
                    />
                ))}
            </div>
        </Section>
    );
}
