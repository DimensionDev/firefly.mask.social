import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';

interface CoverContainerProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function CoverContainer({ theme, children, ...props }: CoverContainerProps) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                // Disabled because of reduced performance
                // backgroundSize: '100% 100%',
                // backgroundImage: theme.normal.bg_image ? `url("${theme.normal.bg_image}")` : '',
                // backgroundColor: theme.normal.bg_color ?? 'transparent',
                backgroundRepeat: 'no-repeat',
                borderRadius: 45,
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
