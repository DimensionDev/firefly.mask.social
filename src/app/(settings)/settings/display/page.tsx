'use client';

import { Trans } from '@lingui/macro';
import { Appearance } from '@masknet/public-api';

import { useThemeModeStore } from '@/store/useThemeModeStore.js';

export default function Display() {
    const setThemeMode = useThemeModeStore.use.setThemeMode();
    const mode = useThemeModeStore.use.themeMode();

    return (
        <div className="flex w-full flex-col items-center p-[24px]">
            <div className=" w-full gap-[24px] text-[18px] font-bold leading-[24px] text-main">
                <Trans>Display</Trans>
            </div>
            <button
                className="my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg border border-neutral-900 bg-white px-3"
                onClick={() => {
                    setThemeMode(Appearance.default);
                }}
            >
                {mode === Appearance.default ? (
                    <div className="relative h-2 w-2 shadow">
                        <div
                            className="absolute left-0 top-0 h-2 w-2 rounded-full bg-[#3DC233]"
                            style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                        />
                    </div>
                ) : null}
                <div className="text-sm font-bold leading-[18px] text-slate-950">
                    <Trans>Follow System</Trans>
                </div>
            </button>
            <button
                className="my-[12px] inline-flex h-[60px] w-[250px] items-center justify-center gap-5 rounded-lg border border-neutral-900 bg-white px-3"
                onClick={() => {
                    setThemeMode(Appearance.light);
                }}
            >
                {mode === Appearance.light ? (
                    <div className="relative h-2 w-2 shadow">
                        <div
                            className="absolute left-0 top-0 h-2 w-2 rounded-full bg-[#3DC233]"
                            style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                        />
                    </div>
                ) : null}
                <div className="text-sm font-bold leading-[18px] text-slate-950">
                    <Trans>Light mode</Trans>
                </div>
            </button>
            <button
                className="inline-flex h-[60px] w-[250px] items-center justify-center gap-4 rounded-lg border border-white bg-slate-950 px-3"
                onClick={() => {
                    setThemeMode(Appearance.dark);
                }}
            >
                {mode === Appearance.dark ? (
                    <div className="relative h-2 w-2 shadow">
                        <div
                            className="absolute left-0 top-0 h-2 w-2 rounded-full bg-[#3DC233]"
                            style={{ filter: 'drop-shadow(0px 4px 10px #3DC233)' }}
                        />
                    </div>
                ) : null}
                <div className="text-sm font-bold leading-[18px] text-white">
                    <Trans>Dark mode</Trans>
                </div>
            </button>
        </div>
    );
}
