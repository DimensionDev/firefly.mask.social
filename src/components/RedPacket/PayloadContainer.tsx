import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';

interface PayloadContainerProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function PayloadContainer({ theme, children, ...props }: PayloadContainerProps) {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                paddingLeft: 68,
                paddingRight: 68,
                alignItems: 'flex-end',
                paddingBottom: 54,
                backgroundSize: '100% 100%',
                backgroundImage: theme.cover.bg_image ? `url("${theme.cover.bg_image}")` : '',
                backgroundColor: theme.cover.bg_color ?? 'transparent',
                backgroundRepeat: 'no-repeat',
                borderRadius: 48,
                ...props.ContainerStyle,
            }}
        >
            <div
                style={{
                    borderWidth: 0,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    background: `linear-gradient(to bottom, rgba(16,16,16,0) 436px, rgba(16,16,16,0.5) 100%)`,
                    width: 1200,
                    height: 840,
                    borderRadius: 48,
                }}
            />
            {children}
        </div>
    );
}
