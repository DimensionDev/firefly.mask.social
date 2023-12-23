'use client';

import { Trans } from '@lingui/macro';
import { Appearance } from '@masknet/public-api';
import { useMediaQuery } from 'usehooks-ts';

import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export default function Display() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();
    const isDarkOS = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div className="flex w-full flex-col items-center p-[24px]">
            <div className=" w-full gap-[24px] text-[18px] font-bold leading-[24px] text-main">
                <Trans>Display</Trans>
            </div>
            <button
                className={`my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg px-3 ${isDarkOS
                    ? 'border border-white bg-darkBottom text-white'
                    : 'border border-neutral-900 bg-white text-slate-950'
                    }`}
                onClick={() => {
                    setThemeMode(Appearance.default);
                }}
            >
                <div className="flex items-center gap-[20px]">
                    {mode === Appearance.default ? (
                        <div
                            className="h-2 w-2 rounded-full bg-success"
                            style={{ filter: 'drop-shadow(0px 4px 10px var(--color-success))' }}
                        />
                    ) : (
                        <div className="h-2 w-2" />
                    )}
                    <div className="text-[15px] font-bold leading-[18px]">
                        <Trans>Follow System</Trans>
                    </div>
                </div>
            </button>
            <button
                className="my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg border border-neutral-900 bg-white px-3"
                onClick={() => {
                    setThemeMode(Appearance.light);
                }}
            >
                <div className="flex items-center gap-[20px]">
                    {mode === Appearance.light ? (
                        <div
                            className="h-2 w-2 rounded-full bg-success"
                            style={{ filter: 'drop-shadow(0px 4px 10px var(--color-success))' }}
                        />
                    ) : (
                        <div className="h-2 w-2" />
                    )}
                    <div className="w-[96px] text-left text-[15px] font-bold leading-[18px] text-slate-950">
                        <Trans>Light mode</Trans>
                    </div>
                </div>
            </button>
            <button
                className="inline-flex h-[60px] w-[250px] items-center justify-center gap-4 rounded-lg border border-white bg-darkBottom px-3"
                onClick={() => {
                    setThemeMode(Appearance.dark);
                }}
            >
                <div className="flex items-center gap-[20px]">
                    {mode === Appearance.dark ? (
                        <div
                            className="h-2 w-2 rounded-full bg-success"
                            style={{ filter: 'drop-shadow(0px 4px 10px var(--color-success))' }}
                        />
                    ) : (
                        <div className="h-2 w-2" />
                    )}
                    <div className="w-[96px] text-left text-[15px] font-bold leading-[18px] text-white">
                        <Trans>Dark mode</Trans>
                    </div>
                </div>
            </button>
        </div>
    );
}
