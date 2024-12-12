import { ThemeProvider } from '@mui/material';

import { MaskLightTheme } from '@/mask/bindings/index.js';
import { RedPacket, type RedPacketProps } from '@/mask/plugins/red-packet/components/RedPacket/index.js';

export function RedPacketInPost({ payload, post }: RedPacketProps) {
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <RedPacket payload={payload} post={post} />
        </ThemeProvider>
    );
}
