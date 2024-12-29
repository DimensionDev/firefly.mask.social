'use client';

import { t, Trans } from '@lingui/macro';
import { getEnumAsArray } from '@masknet/kit';
import { isServer } from '@tanstack/react-query';
import { useMediaQuery } from 'usehooks-ts';

import { changeLocale } from '@/actions/changeLocale.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { OptionButton } from '@/app/(settings)/components/OptionButton.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { Subtitle } from '@/app/(settings)/components/Subtitle.js';
import { Locale, type ThemeMode } from '@/constants/enum.js';
import { useCookie } from '@/helpers/getFromCookies.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { setLocale, supportedLocales } from '@/i18n/index.js';
import { useLocale } from '@/store/useLocale.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export default function General() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const locale = useLocale();
    const rootClass = useCookie('firefly_root_class');

    useNavigatorTitle(t`General`);

    return (
        <Section>
            <Headline>
                <Trans>General</Trans>
            </Headline>

            <Subtitle>
                <Trans>Display</Trans>
            </Subtitle>

            <div className="flex min-h-[220px] flex-col gap-5">
                {[
                    {
                        value: 'default',
                        label: <Trans>Follow System</Trans>,
                    },
                    {
                        value: 'light',
                        label: <Trans>Light Mode</Trans>,
                    },
                    {
                        value: 'dark',
                        label: <Trans>Dark Mode</Trans>,
                    },
                ].map((option, index) => (
                    <OptionButton
                        key={index}
                        darkMode={
                            option.value === 'default'
                                ? isServer
                                    ? rootClass === 'dark'
                                    : isDarkOS
                                : option.value === 'dark'
                        }
                        selected={mode === option.value}
                        label={option.label}
                        onClick={() => {
                            setThemeMode(option.value as ThemeMode);
                        }}
                    />
                ))}
            </div>

            <Subtitle>
                <Trans>Language</Trans>
            </Subtitle>

            <div className="flex min-h-[220px] flex-col gap-5">
                {getEnumAsArray(Locale).map((option, index) => (
                    <OptionButton
                        key={index}
                        selected={option.value === locale}
                        darkMode={mode === 'default' ? (isServer ? rootClass === 'dark' : isDarkOS) : mode === 'dark'}
                        label={supportedLocales[option.value]}
                        onClick={async () => {
                            console.warn('[18n] change locale', option.value);

                            setLocale(option.value);

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
