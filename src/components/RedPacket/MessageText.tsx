import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';

interface MessageTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    message: string;
    ContainerStyle?: React.CSSProperties;
}

export function MessageText({ theme, message, ...props }: MessageTextProps) {
    return (
        <div
            style={{
                ...getCSSPropertiesFromThemeSettings(theme, 'normal', 'title1'),
                position: 'absolute',
                ...props.ContainerStyle,
            }}
        >
            {message}
        </div>
    );
}
