import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import type { ThemeGroupSettings } from '@/providers/types/RedPacket.js';

interface QuoteTextProps {
    theme: ThemeGroupSettings;
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
