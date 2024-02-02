interface ClaimProgressTextProps {
    shares: number;
    remainingShares: number;
    ContainerStyle?: React.CSSProperties;
}

export function ClaimProgressText({ shares, remainingShares, ...props }: ClaimProgressTextProps) {
    const claimProgressText =
        shares === remainingShares ? `${shares} Shares` : `${shares - remainingShares} of ${shares} Claimed`;

    return (
        <div style={{ position: 'absolute', left: 40, bottom: 40, ...props.ContainerStyle }}>{claimProgressText}</div>
    );
}
