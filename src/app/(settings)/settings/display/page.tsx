'use client';

import { Trans } from '@lingui/macro';
import { Appearance } from '@masknet/public-api';
import { useMediaQuery } from 'usehooks-ts';

import { OptionButton } from '@/app/(settings)/components/OptionButton.js';
import { useThemeModeStore } from '@/store/useThemeModeStore.js';

const DisplayOptions = [
    {
        mode: Appearance.default,
        label: <Trans>Follow System</Trans>,
    },
    {
        mode: Appearance.light,
        label: <Trans>Light Mode</Trans>,
    },
    {
        mode: Appearance.dark,
        label: <Trans>Dark Mode</Trans>,
    },
];

export default function Display() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div className="flex w-full flex-col items-center p-[24px]">
            <div className=" w-full gap-[24px] text-[20px] font-bold leading-[24px] text-main">
                <Trans>Display</Trans>
            </div>

            {DisplayOptions.map((option, index) => (
                <OptionButton
                    key={index}
                    darkMode={option.mode === Appearance.default ? isDarkOS : option.mode === Appearance.dark}
                    selected={mode === option.mode}
                    label={option.label}
                    onClick={() => {
                        setThemeMode(option.mode);
                    }}
                />
            ))}
        </div>
    );
}
