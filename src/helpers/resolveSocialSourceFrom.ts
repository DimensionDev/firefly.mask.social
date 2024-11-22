import type { SocialSource } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import type { Profile as FireflyProfile } from '@/providers/types/Firefly.js';

export function resolveSocialSourceFromPlatform(platform: FireflyProfile['platform']): SocialSource {
    return narrowToSocialSource(resolveSource(platform));
}
