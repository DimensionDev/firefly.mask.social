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
                paddingBottom: 54,
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
