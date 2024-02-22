import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

interface MessageTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    message: string;
    ContainerStyle?: React.CSSProperties;
}

export function MessageText({ theme, message, ...props }: MessageTextProps) {
    return (
        <div
            style={{
                color: theme.normal.title1.color,
                fontSize: theme.normal.title1.font_size,
                fontWeight: theme.normal.title1.font_weight,
                lineHeight: `${theme.normal.title1.line_height}px`,
                position: 'absolute',
                ...props.ContainerStyle,
            }}
        >
            {message}
        </div>
    );
}
