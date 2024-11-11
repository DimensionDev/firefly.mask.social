'use client';

import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { getEnumAsArray } from '@masknet/kit';
import { Appearance } from '@masknet/public-api';
import { isServer } from '@tanstack/react-query';
import { useMediaQuery } from 'usehooks-ts';

import { changeLocale } from '@/actions/changeLocale.js';
import { Headline } from '@/app/(settings)/components/Headline.js';
import { OptionButton } from '@/app/(settings)/components/OptionButton.js';
import { Section } from '@/app/(settings)/components/Section.js';
import { Subtitle } from '@/app/(settings)/components/Subtitle.js';
import { Locale } from '@/constants/enum.js';
import { getFromCookies } from '@/helpers/getFromCookies.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { setLocale, supportedLocales } from '@/i18n/index.js';
import { useLocale } from '@/store/useLocale.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export default function General() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');
    const locale = useLocale();
    const rootClass = getFromCookies('firefly_root_class');
    const lingui = useLingui();

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
                        darkMode={
                            option.value === Appearance.default
                                ? isServer
                                    ? rootClass === 'dark'
                                    : isDarkOS
                                : option.value === Appearance.dark
                        }
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

            <div className="flex min-h-[220px] flex-col gap-5">
                {getEnumAsArray(Locale).map((option, index) => (
                    <OptionButton
                        key={index}
                        selected={option.value === locale}
                        darkMode={
                            mode === Appearance.default
                                ? isServer
                                    ? rootClass === 'dark'
                                    : isDarkOS
                                : mode === Appearance.dark
                        }
                        label={supportedLocales[option.value]}
                        onClick={async () => {
                            const data = new FormData();
                            data.append('locale', option.value);
                            await changeLocale(data);
                            setLocale(option.value);
                            lingui.i18n.activate(option.value);
                        }}
                    />
                ))}
            </div>
        </Section>
    );
}
