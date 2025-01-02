'use client';

import { Trans } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { ClickableButton } from '@/components/ClickableButton.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';
import type { MethodItem } from '@/types/telemetry.js';

interface Props {
    item: MethodItem;
}

export function TelemetryMethodButton({ item }: Props) {
    const [{ loading }, onClick] = useAsyncFn(async () => {
        TelemetryProvider.captureEvent(
            EventId.DEBUG,
            {
                message: 'Hello, world!',
            },
            {
                provider_filter: item.providerFilter,
            },
        );
    }, [item.providerFilter]);

    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            disabled={loading}
            onClick={() => {
                onClick();
            }}
        >
            <Trans>Send</Trans>
        </ClickableButton>
    );
}
