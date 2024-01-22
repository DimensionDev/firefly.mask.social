/* eslint-disable react/no-unescaped-entities */

interface QuoteTextProps {
    ContainerStyle?: React.CSSProperties;
}

export function QuoteText(props: QuoteTextProps) {
    return (
        <div style={{ position: 'absolute', fontSize: 30, fontWeight: 400, bottom: 30, ...props.ContainerStyle }}>
            "The lack of money is the root of all evil." - Mark Twain
        </div>
    );
}
