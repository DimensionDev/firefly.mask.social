import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';

interface QuoteTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    ContainerStyle?: React.CSSProperties;
}

export function QuoteText({ theme, ContainerStyle }: QuoteTextProps) {
    return (
        <div
            style={{
                ...getCSSPropertiesFromThemeSettings(theme.cover.title4),
                position: 'absolute',
                bottom: 30,
                ...ContainerStyle,
            }}
        >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            "The lack of money is the root of all evil." - Mark Twain
        </div>
    );
}
