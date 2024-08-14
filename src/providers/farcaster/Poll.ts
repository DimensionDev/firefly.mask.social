import { Source, SourceInURL } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { SetQueryDataForVote } from '@/decorators/SetQueryDataForVote.js';
import { getCurrentProfile } from '@/helpers/getCurrentProfile.js';
import { getPollDurationSeconds } from '@/helpers/polls.js';
import { HubbleFrameProvider } from '@/providers/hubble/Frame.js';
import type { CompositePoll, Poll, PollOption, Provider, VoteResponseData } from '@/providers/types/Poll.js';
import { commitPoll, vote } from '@/services/poll.js';
import type { Index } from '@/types/frame.js';

@SetQueryDataForVote(Source.Farcaster)
class FarcasterPoll implements Provider {
    async createPoll(poll: CompositePoll, text = ''): Promise<Poll> {
        return {
            id: poll.id || (await commitPoll(poll, text)),
            options: poll.options,
            durationSeconds: getPollDurationSeconds(poll.duration),
            source: Source.Farcaster,
            type: poll.type,
            strategies: poll.strategies,
            multiple_count: poll.multiple_count,
        };
    }

    async vote({
        postId,
        pollId,
        frameUrl,
        option,
    }: {
        postId: string;
        pollId: string;
        frameUrl: string;
        option: PollOption;
    }): Promise<VoteResponseData> {
        const profile = getCurrentProfile(Source.Farcaster);
        if (!profile) throw new Error('Profile not found');
        const packet = await HubbleFrameProvider.generateSignaturePacket(postId, frameUrl, +option.id as Index);
        return await vote({
            poll_id: pollId,
            platform: SourceInURL.Farcaster,
            platform_id: profile.profileId,
            choices: [+option.id],
            lens_token: '',
            farcaster_signature: packet.trustedData.messageBytes,
            wallet_address: '',
            original_message: JSON.stringify(packet.untrustedData),
            signature_message: packet.trustedData.messageBytes,
        });
    }

    getPollById(pollId: string): Promise<Poll> {
        throw new NotImplementedError();
    }
}

export const FarcasterPollProvider = new FarcasterPoll();
