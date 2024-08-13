import type { SocialSource } from '@/constants/enum.js';
import { POLL_STRATEGIES } from '@/constants/poll.js';
import type { FireflyPoll, Poll } from '@/providers/types/Poll.js';

export function formatFireflyPoll(poll: FireflyPoll, source: SocialSource): Poll {
    return {
        id: poll.poll_id,
        options: poll.choice_detail.map((choice) => ({
            id: `${choice.id}`,
            position: choice.id,
            label: choice.name,
            votes: choice.count,
            isVoted: choice.is_select,
            percent: choice.percent,
        })),
        source,
        durationSeconds: poll.end_time - poll.created_time,
        votingStatus: poll.is_end ? 'closed' : 'open',
        type: poll.type,
        multiple_count: `${poll.multiple_count}`,
        strategies: POLL_STRATEGIES.None,
        endDatetime: new Date(poll.end_time * 1000).toISOString(),
    };
}
