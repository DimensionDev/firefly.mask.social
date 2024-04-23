import type { Metrics } from '@/app/api/firefly/metrics/download/route.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import type { Session } from '@/providers/types/Session.js';
import type { ResponseJSON } from '@/types/index.js';

export async function syncSessionFromFirefly(session: Session) {
    const fireflySession = await FireflySession.from(session);

    const response = await fetchJSON<ResponseJSON<Metrics>>('/api/firefly/metrics/download', {
        method: 'POST',
        body: JSON.stringify({
            accessToken: fireflySession.token,
        }),
    });
    if (!response.success) throw new Error(response.error.message);

    const metrics = response.data;
    return metrics;
}
