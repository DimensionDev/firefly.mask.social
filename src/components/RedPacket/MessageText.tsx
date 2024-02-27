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
                ...getCSSPropertiesFromThemeSettings(theme.normal.title1),
                display: 'flex',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                ...props.ContainerStyle,
            }}
        >
            <div
                style={{
                    maxWidth: '100%',
                    paddingLeft: 60,
                    paddingRight: 60,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                }}
            >
                {message}
            </div>
        </div>
    );
}
