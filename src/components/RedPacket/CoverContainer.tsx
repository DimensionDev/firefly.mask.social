import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

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
                borderRadius: 45,
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
