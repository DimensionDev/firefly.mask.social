interface CoverContainerProps {
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function CoverContainer({ children, ...props }: CoverContainerProps) {
    return (
        <div
            style={{
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
                position: 'relative',
                paddingBottom: 54,
                ...props.ContainerStyle,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    background: 'linear-gradient(to bottom, rgba(16,16,16,0) 0%, rgba(16,16,16,0.5) 50%)',
                    width: 1200,
                    height: 404,
                }}
            />
            {children}
        </div>
    );
}
