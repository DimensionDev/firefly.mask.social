import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';

interface MessageTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    message: string;
    ContainerStyle?: React.CSSProperties;
}

export function MessageText({ theme, message, ...props }: MessageTextProps) {
    return (
        <div
            style={{
                ...getCSSPropertiesFromThemeSettings(theme.normal.title1),
                display: 'flex',
                fontSize: 40,
                ...props.ContainerStyle,
            }}
        >
            <div
                style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    WebkitLineClamp: 2,
                    boxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                }}
            >
                {message}
            </div>
        </div>
    );
}
