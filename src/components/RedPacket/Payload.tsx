import { PayloadContainer } from '@/components/RedPacket/PayloadContainer.jsx';
import { Theme, TokenType } from '@/types/rp.js';

interface RedPacketPayloadProps {
    theme: Theme;
    amount: string; // bigint in str
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
}

function PayloadForMask() {
    return (
        <PayloadContainer theme={Theme.Mask}>
            <p>&nbsp;</p>
        </PayloadContainer>
    );
}

export function RedPacketPayload(props: RedPacketPayloadProps) {
    switch (props.theme) {
        case Theme.Mask:
            return <PayloadForMask />;
        default:
            return null;
    }
}
