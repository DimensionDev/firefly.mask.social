import { Theme } from '@/types/rp.js';

interface CoverContainerProps {
    theme: Theme;
    backgroundColor?: string;
    backgroundImage?: string;
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function CoverContainer({ theme, backgroundColor, backgroundImage, children, ...props }: CoverContainerProps) {
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
                backgroundSize: '100% 100%',
                backgroundImage: backgroundImage ? `url("${backgroundImage}")` : '',
                backgroundColor: backgroundColor ?? 'transparent',
                backgroundRepeat: 'no-repeat',
                borderRadius: 45,
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
