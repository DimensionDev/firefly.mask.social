import type { FireflySession } from '@/providers/firefly/Session.js';
import type { Session } from '@/providers/types/Session.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export type AccountOrigin = 'inherent' | 'sync';

export interface Account {
    origin?: AccountOrigin;
    profile: Profile;
    session: Session;
    fireflySession?: FireflySession;
}
