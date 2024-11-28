import { RedPacket, type RedPacketProps } from '@/mask/plugins/red-packet/components/RedPacket/index.js';
import { MaskLightTheme } from '@masknet/theme';
import { ThemeProvider } from '@mui/material';

export function RedPacketInPost({ payload }: RedPacketProps) {
    return (
        <ThemeProvider theme={MaskLightTheme}>
            <RedPacket payload={payload} />
        </ThemeProvider>
    );
}
