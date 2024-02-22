import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

interface QuoteTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    ContainerStyle?: React.CSSProperties;
}

export function QuoteText({ theme, ContainerStyle }: QuoteTextProps) {
    return (
        <div
            style={{
                position: 'absolute',
                color: theme.cover.title4.color,
                fontSize: theme.cover.title4.font_size,
                fontWeight: theme.cover.title4.font_weight,
                lineHeight: `${theme.cover.title4.line_height}px`,
                bottom: 30,
                ...ContainerStyle,
            }}
        >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            "The lack of money is the root of all evil." - Mark Twain
        </div>
    );
}
